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
