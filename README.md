# ⚡ PCOTLG  

This is a **Next.js starter project** for Firebase Studio, now connected to the **PCOTLG repository**.  

## 🚀 Getting Started  

To get started, take a look at `src/app/page.tsx`.  

## 🔑 Environment Variables  

To enable all features, you must configure environment variables for both your local development environment (`.env` file) and for your deployed application (**Firebase Secret Manager**).  

### 💻 Local Development (`.env` file)  

Create a `.env` file in the root of your project and add the following variables:  

```env
# 🌐 Your public app URL (for local development)
NEXT_PUBLIC_APP_URL=http://localhost:9000

# 🔥 Your Firebase Project ID
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id

# 📲 Your FCM VAPID Key for Push Notifications
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your-fcm-vapid-key

# 🛠 Firebase Service Account JSON
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'

# 📧 Example for Gmail SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_FROM_NAME="PCOTLG App"

☁️ Deployed Application (Firebase Secret Manager)

Your deployed application uses the apphosting.yaml file to safely access environment variables via Firebase Secret Manager. You must create these secrets in your Firebase project for the deployed app to work correctly.

📝 To create secrets:

1. ⚙️ Go to your Firebase Project Settings.


2. 📊 Navigate to the Dashboard section of App Hosting.


3. 🔒 Click Manage on your App Hosting backend.


4. 🛠 Go to the Settings tab.


5. ➕ In the Secrets section, click Create secret for each variable listed in apphosting.yaml.



Secrets you need to create:

🔑 FIREBASE_SERVICE_ACCOUNT_JSON

🌐 NEXT_PUBLIC_APP_URL (your production URL)

🔥 NEXT_PUBLIC_FIREBASE_PROJECT_ID

📲 NEXT_PUBLIC_FIREBASE_VAPID_KEY

📧 SMTP_HOST

📮 SMTP_PORT

👤 SMTP_USER

🔐 SMTP_PASS

🏷 SMTP_FROM_NAME


After creating the secrets, 🚢 re-deploy your application for the changes to take effect.

Do you also want me to add **badges (shields.io)** at the very top (for Next.js, Firebase, License, etc.) so it looks like a polished open-source project?

