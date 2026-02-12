#!/bin/bash
# ──────────────────────────────────────────────────
# Polarity Lab — Full SES + Cloudflare DNS Setup
#
# ONE SCRIPT. Paste into EC2 Instance Connect.
# Does everything: SES domain verify, DKIM, Cloudflare
# DNS records, IAM role, instance profile, production
# access request.
#
# Usage:
#   bash full-ses-setup.sh
# ──────────────────────────────────────────────────

set -e

REGION="us-east-2"
DOMAIN="polarity-lab.com"
ROLE_NAME="polarity-ses-role"
PROFILE_NAME="polarity-ses-profile"
CF_TOKEN="H4VNNsA07PdLKV5zAZiP9XAxwUm5gs6OrwfS2wBu"
CF_ZONE_ID="f58f41ca48d15f1ff0cfbe3902fa9b83"
CF_API="https://api.cloudflare.com/client/v4"

echo ""
echo "================================================"
echo "  Full SES + Cloudflare Setup for $DOMAIN"
echo "  Region: $REGION"
echo "================================================"
echo ""

# ─── Helper: add DNS record via Cloudflare API ───

add_dns_record() {
  local TYPE="$1"
  local NAME="$2"
  local CONTENT="$3"
  local COMMENT="$4"

  echo "  Adding $TYPE record: $NAME"

  RESPONSE=$(curl -s -X POST "$CF_API/zones/$CF_ZONE_ID/dns_records" \
    -H "Authorization: Bearer $CF_TOKEN" \
    -H "Content-Type: application/json" \
    --data "{
      \"type\": \"$TYPE\",
      \"name\": \"$NAME\",
      \"content\": \"$CONTENT\",
      \"ttl\": 1,
      \"proxied\": false,
      \"comment\": \"$COMMENT\"
    }")

  SUCCESS=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('success', False))" 2>/dev/null || echo "False")

  if [ "$SUCCESS" = "True" ]; then
    echo "    OK"
  else
    ERROR=$(echo "$RESPONSE" | python3 -c "import sys,json; errs=json.load(sys.stdin).get('errors',[]); print(errs[0].get('message','unknown') if errs else 'unknown')" 2>/dev/null || echo "unknown")
    if echo "$ERROR" | grep -qi "already exist"; then
      echo "    Already exists (skipping)"
    else
      echo "    WARN: $ERROR"
    fi
  fi
}

update_dns_record() {
  local RECORD_ID="$1"
  local TYPE="$2"
  local NAME="$3"
  local CONTENT="$4"
  local COMMENT="$5"

  echo "  Updating $TYPE record: $NAME"

  RESPONSE=$(curl -s -X PATCH "$CF_API/zones/$CF_ZONE_ID/dns_records/$RECORD_ID" \
    -H "Authorization: Bearer $CF_TOKEN" \
    -H "Content-Type: application/json" \
    --data "{
      \"type\": \"$TYPE\",
      \"name\": \"$NAME\",
      \"content\": \"$CONTENT\",
      \"ttl\": 1,
      \"proxied\": false,
      \"comment\": \"$COMMENT\"
    }")

  SUCCESS=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('success', False))" 2>/dev/null || echo "False")

  if [ "$SUCCESS" = "True" ]; then
    echo "    OK (updated)"
  else
    echo "    WARN: update failed"
  fi
}

# ─── Step 0: Verify AWS access ───

echo "[check] Verifying AWS credentials..."
ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text --region $REGION 2>/dev/null) || {
  echo "ERROR: No AWS credentials. This instance needs an IAM role."
  echo "Go to EC2 Console > Instance > Actions > Security > Modify IAM Role"
  exit 1
}
echo "[check] AWS Account: $ACCOUNT_ID"

INSTANCE_ID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id 2>/dev/null || echo "")
echo "[check] Instance: ${INSTANCE_ID:-unknown}"

echo "[check] Verifying Cloudflare token..."
CF_STATUS=$(curl -s "$CF_API/user/tokens/verify" -H "Authorization: Bearer $CF_TOKEN" | python3 -c "import sys,json; print(json.load(sys.stdin).get('success', False))" 2>/dev/null)
if [ "$CF_STATUS" != "True" ]; then
  echo "ERROR: Cloudflare token invalid"
  exit 1
fi
echo "[check] Cloudflare token valid"

# ─── Step 1: SES domain verification ───

echo ""
echo "[ses] Verifying domain $DOMAIN in SES..."
VERIFICATION_TOKEN=$(aws ses verify-domain-identity \
  --domain $DOMAIN \
  --region $REGION \
  --query "VerificationToken" \
  --output text)
echo "[ses] Verification token: $VERIFICATION_TOKEN"

# ─── Step 2: SES DKIM ───

echo ""
echo "[ses] Enabling DKIM for $DOMAIN..."
DKIM_TOKENS=$(aws ses verify-domain-dkim \
  --domain $DOMAIN \
  --region $REGION \
  --query "DkimTokens" \
  --output text)
echo "[ses] DKIM tokens: $DKIM_TOKENS"

# ─── Step 3: Add DNS records to Cloudflare ───

echo ""
echo "[cloudflare] Adding DNS records for SES..."
echo ""

# 3a. Domain verification TXT
add_dns_record "TXT" "_amazonses.$DOMAIN" "$VERIFICATION_TOKEN" "AWS SES domain verification"

# 3b. DKIM CNAME records (3 of them)
for TOKEN in $DKIM_TOKENS; do
  add_dns_record "CNAME" "${TOKEN}._domainkey.$DOMAIN" "${TOKEN}.dkim.amazonses.com" "AWS SES DKIM"
done

# 3c. SPF -- need to update existing record to include amazonses.com
# Current SPF: "v=spf1 include:_spf.google.com ~all"
# New SPF:     "v=spf1 include:_spf.google.com include:amazonses.com ~all"
echo ""
echo "[cloudflare] Updating SPF record to include Amazon SES..."

# Find existing SPF record ID
SPF_RECORD_ID=$(curl -s "$CF_API/zones/$CF_ZONE_ID/dns_records?type=TXT&name=$DOMAIN" \
  -H "Authorization: Bearer $CF_TOKEN" | \
  python3 -c "
import sys, json
data = json.load(sys.stdin)
for r in data.get('result', []):
    if 'v=spf1' in r.get('content', ''):
        print(r['id'])
        break
" 2>/dev/null)

if [ -n "$SPF_RECORD_ID" ]; then
  update_dns_record "$SPF_RECORD_ID" "TXT" "$DOMAIN" "v=spf1 include:_spf.google.com include:amazonses.com ~all" "SPF for Google + Amazon SES"
else
  add_dns_record "TXT" "$DOMAIN" "v=spf1 include:amazonses.com ~all" "SPF for Amazon SES"
fi

# 3d. DMARC record
echo ""
add_dns_record "TXT" "_dmarc.$DOMAIN" "v=DMARC1; p=none; rua=mailto:team@$DOMAIN" "DMARC policy"

echo ""
echo "[cloudflare] DNS records complete"

# ─── Step 4: IAM role + instance profile ───

echo ""
echo "[iam] Creating SES role and attaching to instance..."

TRUST_POLICY='{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"ec2.amazonaws.com"},"Action":"sts:AssumeRole"}]}'

aws iam create-role \
  --role-name "$ROLE_NAME" \
  --assume-role-policy-document "$TRUST_POLICY" \
  --description "EC2 SES send for Polarity Lab" \
  2>/dev/null && echo "[iam] Role created" || echo "[iam] Role already exists"

SES_POLICY='{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":["ses:SendEmail","ses:SendRawEmail","ses:GetSendQuota","ses:GetSendStatistics","ses:GetIdentityVerificationAttributes","ses:GetIdentityDkimAttributes"],"Resource":"*"}]}'

aws iam put-role-policy \
  --role-name "$ROLE_NAME" \
  --policy-name "ses-send-email" \
  --policy-document "$SES_POLICY"
echo "[iam] SES policy attached"

aws iam create-instance-profile \
  --instance-profile-name "$PROFILE_NAME" \
  2>/dev/null && echo "[iam] Instance profile created" || echo "[iam] Instance profile exists"

aws iam add-role-to-instance-profile \
  --instance-profile-name "$PROFILE_NAME" \
  --role-name "$ROLE_NAME" \
  2>/dev/null && echo "[iam] Role added to profile" || echo "[iam] Role already in profile"

# Attach to this instance
if [ -n "$INSTANCE_ID" ]; then
  echo "[iam] Waiting 10s for IAM propagation..."
  sleep 10

  CURRENT_PROFILE=$(aws ec2 describe-instances \
    --region $REGION \
    --instance-ids "$INSTANCE_ID" \
    --query "Reservations[0].Instances[0].IamInstanceProfile.Arn" \
    --output text 2>/dev/null)

  if [ "$CURRENT_PROFILE" = "None" ] || [ -z "$CURRENT_PROFILE" ]; then
    aws ec2 associate-iam-instance-profile \
      --region $REGION \
      --instance-id "$INSTANCE_ID" \
      --iam-instance-profile Name="$PROFILE_NAME" \
      && echo "[iam] Profile attached to instance" \
      || echo "[iam] Could not attach (may need existing profile replaced)"
  else
    echo "[iam] Instance already has profile: $CURRENT_PROFILE"
    ASSOC_ID=$(aws ec2 describe-iam-instance-profile-associations \
      --region $REGION \
      --filters "Name=instance-id,Values=$INSTANCE_ID" \
      --query "IamInstanceProfileAssociations[0].AssociationId" \
      --output text 2>/dev/null)
    if [ -n "$ASSOC_ID" ] && [ "$ASSOC_ID" != "None" ]; then
      aws ec2 replace-iam-instance-profile-association \
        --region $REGION \
        --association-id "$ASSOC_ID" \
        --iam-instance-profile Name="$PROFILE_NAME" \
        && echo "[iam] Profile replaced" \
        || echo "[iam] Current profile may already have SES access (fine)"
    fi
  fi
fi

# ─── Step 5: Verify sender email ───

echo ""
echo "[ses] Verifying sender email team@$DOMAIN..."
aws ses verify-email-identity \
  --email-address "team@$DOMAIN" \
  --region $REGION 2>/dev/null \
  && echo "[ses] Verification email sent to team@$DOMAIN" \
  || echo "[ses] Email may already be verified"

# ─── Step 6: Request production access ───

echo ""
echo "[ses] Checking sandbox status..."
PRODUCTION=$(aws sesv2 get-account --region $REGION --query "ProductionAccessEnabled" --output text 2>/dev/null || echo "unknown")

if [ "$PRODUCTION" = "True" ] || [ "$PRODUCTION" = "true" ]; then
  echo "[ses] Already in PRODUCTION mode"
elif [ "$PRODUCTION" = "False" ] || [ "$PRODUCTION" = "false" ]; then
  echo "[ses] In SANDBOX mode. Requesting production access..."
  aws sesv2 put-account-details \
    --region $REGION \
    --mail-type TRANSACTIONAL \
    --website-url "https://polarity-lab.com" \
    --use-case-description "Sending personalized investor outreach emails for our AI startup Polarity Lab. Low volume, under 200 per day. All recipients are business contacts in the venture capital industry." \
    --contact-language EN \
    --production-access-enabled 2>/dev/null \
    && echo "[ses] Production access requested (usually approved within 24h)" \
    || echo "[ses] Could not request. Do it manually at: https://console.aws.amazon.com/ses/home?region=$REGION#/account"
else
  echo "[ses] Could not determine sandbox status"
fi

# ─── Step 7: Poll for domain verification ───

echo ""
echo "[ses] Waiting for DNS propagation and domain verification..."
echo "[ses] (This can take 1-5 minutes after Cloudflare records are added)"

for i in 1 2 3 4 5 6 7 8 9 10; do
  STATUS=$(aws ses get-identity-verification-attributes \
    --identities $DOMAIN \
    --region $REGION \
    --query "VerificationAttributes.\"$DOMAIN\".VerificationStatus" \
    --output text 2>/dev/null || echo "Pending")

  if [ "$STATUS" = "Success" ]; then
    echo "[ses] Domain VERIFIED"
    break
  fi

  echo "[ses] Status: $STATUS (attempt $i/10, waiting 30s...)"
  sleep 30
done

# Check DKIM
DKIM_STATUS=$(aws ses get-identity-dkim-attributes \
  --identities $DOMAIN \
  --region $REGION \
  --query "DkimAttributes.\"$DOMAIN\".DkimVerificationStatus" \
  --output text 2>/dev/null || echo "Pending")
echo "[ses] DKIM status: $DKIM_STATUS"

# ─── Summary ───

echo ""
echo "================================================"
echo "  SETUP COMPLETE"
echo "================================================"
echo ""
echo "Domain verification: $STATUS"
echo "DKIM status: $DKIM_STATUS"
echo "Production access: $PRODUCTION"
echo ""
if [ "$STATUS" = "Success" ]; then
  echo "SES is READY. You can now send emails."
  echo ""
  echo "Next steps:"
  echo "  cd ~/content-manager && git pull"
  echo "  npx tsx scripts/test-email.ts"
  echo "  npx tsx scripts/send-targeted-wave.ts"
else
  echo "Domain is still verifying. Check again with:"
  echo "  aws ses get-identity-verification-attributes --identities $DOMAIN --region $REGION"
  echo ""
  echo "Once verified:"
  echo "  cd ~/content-manager && git pull"
  echo "  npx tsx scripts/test-email.ts"
  echo "  npx tsx scripts/send-targeted-wave.ts"
fi
echo ""
echo "================================================"
