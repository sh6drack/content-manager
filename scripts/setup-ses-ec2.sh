#!/bin/bash
# ──────────────────────────────────────────────────
# Polarity Lab — AWS SES Setup (run on EC2 instance)
# Paste this entire block into EC2 Instance Connect.
#
# What this does:
#   1. Verifies polarity-lab.com domain in SES
#   2. Enables DKIM signing
#   3. Creates IAM role with SES permissions
#   4. Attaches role to this EC2 instance
#   5. Requests production access (exits sandbox)
#   6. Verifies sender email
#   7. Prints DNS records to add
# ──────────────────────────────────────────────────

set -e

REGION="us-east-2"
DOMAIN="polarity-lab.com"
ROLE_NAME="polarity-ses-role"
PROFILE_NAME="polarity-ses-profile"

echo ""
echo "================================================"
echo "  AWS SES Setup for $DOMAIN"
echo "  Region: $REGION"
echo "================================================"
echo ""

# ─── Step 0: Get instance ID + verify credentials ───

echo "[check] Detecting instance ID..."
INSTANCE_ID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id)
echo "[check] Instance: $INSTANCE_ID"

echo "[check] Verifying AWS access..."
ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text --region $REGION 2>/dev/null) || {
  echo ""
  echo "ERROR: No AWS credentials available on this instance."
  echo "The instance may not have an IAM role attached yet."
  echo ""
  echo "Quick fix — attach the AWS managed policy temporarily:"
  echo "  Go to AWS Console > EC2 > Instances > $INSTANCE_ID"
  echo "  Actions > Security > Modify IAM Role"
  echo "  Create/attach a role with AdministratorAccess (we will scope it down after)"
  echo ""
  exit 1
}
echo "[check] Account: $ACCOUNT_ID"

# ─── Step 1: Verify domain in SES ───

echo ""
echo "[ses] Verifying domain $DOMAIN..."
VERIFICATION_TOKEN=$(aws ses verify-domain-identity \
  --domain $DOMAIN \
  --region $REGION \
  --query "VerificationToken" \
  --output text)
echo "[ses] Verification token: $VERIFICATION_TOKEN"

# ─── Step 2: Enable DKIM ───

echo ""
echo "[ses] Enabling DKIM for $DOMAIN..."
DKIM_TOKENS=$(aws ses verify-domain-dkim \
  --domain $DOMAIN \
  --region $REGION \
  --query "DkimTokens" \
  --output text)
echo "[ses] DKIM tokens received"

# ─── Step 3: Verify sender email ───

echo ""
echo "[ses] Verifying sender email team@$DOMAIN..."
aws ses verify-email-identity \
  --email-address "team@$DOMAIN" \
  --region $REGION 2>/dev/null \
  && echo "[ses] Verification email sent to team@$DOMAIN" \
  || echo "[ses] Could not verify email (may already be verified)"

# ─── Step 4: Create SES IAM role ───

echo ""
echo "[iam] Creating IAM role: $ROLE_NAME..."

TRUST_POLICY='{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": "ec2.amazonaws.com"},
    "Action": "sts:AssumeRole"
  }]
}'

aws iam create-role \
  --role-name "$ROLE_NAME" \
  --assume-role-policy-document "$TRUST_POLICY" \
  --description "EC2 SES access for Polarity Lab" \
  2>/dev/null && echo "[iam] Role created" || echo "[iam] Role already exists"

SES_POLICY='{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "ses:SendEmail",
      "ses:SendRawEmail",
      "ses:GetSendQuota",
      "ses:GetSendStatistics"
    ],
    "Resource": "*"
  }]
}'

aws iam put-role-policy \
  --role-name "$ROLE_NAME" \
  --policy-name "ses-send-email" \
  --policy-document "$SES_POLICY"
echo "[iam] SES policy attached to role"

# ─── Step 5: Create instance profile + attach to this instance ───

echo ""
echo "[iam] Setting up instance profile..."

aws iam create-instance-profile \
  --instance-profile-name "$PROFILE_NAME" \
  2>/dev/null && echo "[iam] Profile created" || echo "[iam] Profile already exists"

aws iam add-role-to-instance-profile \
  --instance-profile-name "$PROFILE_NAME" \
  --role-name "$ROLE_NAME" \
  2>/dev/null && echo "[iam] Role added to profile" || echo "[iam] Role already in profile"

echo "[iam] Waiting 10s for IAM propagation..."
sleep 10

# Check current profile on instance
CURRENT_PROFILE=$(aws ec2 describe-instances \
  --region $REGION \
  --instance-ids "$INSTANCE_ID" \
  --query "Reservations[0].Instances[0].IamInstanceProfile.Arn" \
  --output text 2>/dev/null)

if [ "$CURRENT_PROFILE" = "None" ] || [ -z "$CURRENT_PROFILE" ]; then
  echo "[ec2] Attaching profile to this instance..."
  aws ec2 associate-iam-instance-profile \
    --region $REGION \
    --instance-id "$INSTANCE_ID" \
    --iam-instance-profile Name="$PROFILE_NAME" \
    && echo "[ec2] Profile attached" \
    || echo "[ec2] Could not attach (may need to detach current profile first)"
else
  echo "[ec2] Instance already has profile: $CURRENT_PROFILE"
  echo "[ec2] Replacing with $PROFILE_NAME..."
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
      && echo "[ec2] Profile replaced" \
      || echo "[ec2] Replace failed — the current role may already have SES access, which is fine"
  fi
fi

# ─── Step 6: Check sandbox status + request production ───

echo ""
echo "[ses] Checking sandbox status..."
PRODUCTION=$(aws sesv2 get-account --region $REGION --query "ProductionAccessEnabled" --output text 2>/dev/null || echo "unknown")

if [ "$PRODUCTION" = "True" ] || [ "$PRODUCTION" = "true" ]; then
  echo "[ses] Already in PRODUCTION mode. No sending limits."
elif [ "$PRODUCTION" = "False" ] || [ "$PRODUCTION" = "false" ]; then
  echo "[ses] Account is in SANDBOX mode."
  echo "[ses] Requesting production access..."
  aws sesv2 put-account-details \
    --region $REGION \
    --mail-type TRANSACTIONAL \
    --website-url "https://polarity-lab.com" \
    --use-case-description "Sending personalized investor outreach emails for our AI startup Polarity Lab. Low volume, under 500 per day. All recipients are business contacts in the venture capital industry who we have professional relationships with." \
    --contact-language EN \
    --production-access-enabled 2>/dev/null \
    && echo "[ses] Production access requested. Usually approved within 24 hours." \
    || echo "[ses] Could not request via CLI. Do it manually: https://console.aws.amazon.com/ses/home?region=$REGION#/account"
else
  echo "[ses] Could not determine sandbox status."
fi

# ─── Step 7: Check verification status ───

echo ""
echo "[ses] Current domain verification status:"
aws ses get-identity-verification-attributes \
  --identities $DOMAIN \
  --region $REGION \
  --output table 2>/dev/null || echo "(could not check)"

# ─── DNS Records ───

echo ""
echo "================================================"
echo "  ADD THESE DNS RECORDS TO $DOMAIN"
echo "================================================"
echo ""
echo "1. Domain Verification (TXT):"
echo "   Name:  _amazonses.$DOMAIN"
echo "   Type:  TXT"
echo "   Value: $VERIFICATION_TOKEN"
echo ""
echo "2. DKIM (3 CNAME records):"
for TOKEN in $DKIM_TOKENS; do
  echo "   Name:  ${TOKEN}._domainkey.$DOMAIN"
  echo "   Type:  CNAME"
  echo "   Value: ${TOKEN}.dkim.amazonses.com"
  echo ""
done
echo "3. SPF (TXT — add to existing or create new):"
echo "   Name:  $DOMAIN"
echo "   Type:  TXT"
echo "   Value: v=spf1 include:amazonses.com ~all"
echo ""
echo "4. DMARC (TXT):"
echo "   Name:  _dmarc.$DOMAIN"
echo "   Type:  TXT"
echo "   Value: v=DMARC1; p=none; rua=mailto:team@$DOMAIN"
echo ""
echo "================================================"
echo "  NEXT STEPS"
echo "================================================"
echo ""
echo "1. Add the DNS records above to your domain registrar"
echo "2. Wait for domain verification (check with):"
echo "     aws ses get-identity-verification-attributes --identities $DOMAIN --region $REGION"
echo "3. Check inbox for team@$DOMAIN verification email and click the link"
echo "4. Once verified, test:"
echo "     cd ~/content-manager && npx tsx scripts/test-email.ts"
echo "5. Fire remaining targeted investors:"
echo "     npx tsx scripts/send-targeted-wave.ts"
echo ""
echo "================================================"
