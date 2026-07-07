# Frontend - ERP Inventory and Sales Management System

This is the user interface of the application. Follow these simple steps to run it on your computer.

## How to Run the Frontend

### Step 1: Download the Code
Open your terminal (or Command Prompt) and run the following command to download the code:
```bash
git clone https://github.com/riya1689/ERP-Inventory-Sales-Management-System-frontend.git
```

### Step 2: Open the Folder
Go inside the downloaded folder:
```bash
cd ERP-Inventory-Sales-Management-System-frontend
```

### Step 3: Install Required Files
Run this command to install all the necessary files for the frontend to work:
```bash
npm install
```

### Step 4: Connect to the Backend
Create a new text file inside the folder and name it `.env`. Open this file and paste the following line inside it:
```env
VITE_API_URL=http://localhost:5000/api
```
This tells the frontend how to talk to your backend server.

### Step 5: Start the Website
Run this command to turn on the website:
```bash
npm run dev
```

### Step 6: Open in Browser
Once the previous command finishes, it will give you a local link (usually `http://localhost:5173/`). Copy that link and paste it into your web browser to see the website!
