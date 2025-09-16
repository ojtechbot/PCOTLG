
# PCOTLG

This is a Next.js starter project for Firebase Studio, now connected to the PCOTLG repository.

## Getting Started

To get started, take a look at `src/app/page.tsx`.

## Environment Variables

To enable all features, you must configure environment variables for both your local development environment (`.env` file) and for your deployed application (Firebase Secret Manager).

### Local Development (.env file)

Create a `.env` file in the root of your project and add the following variables.

```env
# Your public app URL (for local development)
NEXT_PUBLIC_APP_URL=http://localhost:9000

# Your Firebase Project ID
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id

# Your FCM VAPID Key for Push Notifications
# In Firebase Console: Project Settings > Cloud Messaging > Web Push certificates.
# Click "Generate key pair" and copy the public key here.
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your-fcm-vapid-key

# Firebase Service Account JSON
# In Firebase Console: Project Settings > Service accounts > Generate new private key
# Copy the entire content of the downloaded JSON file and paste it here as a single line string.
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'

# Example for Gmail SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_FROM_NAME="PCOTLG App"
```

### Deployed Application (Firebase Secret Manager)

Your deployed application uses the `apphosting.yaml` file to safely access environment variables via Firebase Secret Manager. You **must** create these secrets in your Firebase project for the deployed app to work correctly.

**To create secrets:**

1.  Go to your Firebase Project Settings.
2.  Navigate to the **Dashboard** section of **App Hosting**.
3.  Click **Manage** on your App Hosting backend.
4.  Go to the **Settings** tab.
5.  In the **Secrets** section, click **Create secret** for each of the variables listed in `apphosting.yaml`. The secret name should match the variable name (e.g., create a secret named `FIREBASE_SERVICE_ACCOUNT_JSON` and paste the full JSON content as its value).

You need to create secrets for:
-   `FIREBASE_SERVICE_ACCOUNT_JSON`
-   `SMTP_HOST`
-   `SMTP_PORT`
-   `SMTP_USER`
-   `SMTP_PASS`
-   `SMTP_FROM_NAME`
-   `NEXT_PUBLIC_APP_URL` (Use your public production URL here)
-   `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
-   `NEXT_PUBLIC_FIREBASE_VAPID_KEY`

After creating the secrets, **re-deploy your application** for the changes to take effect.
