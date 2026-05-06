import * as readline from "readline";

// ─────────────────────────────────────────────────────────
// Async prompt (Windows compatible)
// ─────────────────────────────────────────────────────────
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function prompt(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer));
  });
}

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────
function formatDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function randomDigits(count: number): string {
  let s = "";
  for (let i = 0; i < count; i++) s += Math.floor(Math.random() * 10);
  return s;
}

// ─────────────────────────────────────────────────────────
// Account class
// ─────────────────────────────────────────────────────────
class Account {
  constructor(
    private userId: string,
    private accountNumber: string,
    private cifNumber: string,
    private accountHolder: string,
    private password: string,
    private debitCardNumber: string,
    private cardType: string,
    private nricNumber: string
  ) {
    this.balance = 0;
    this.dateJoined = new Date();
  }

  private balance: number;
  private dateJoined: Date;

  getAccountNumber() { return this.accountNumber; }
  getAccountHolder() { return this.accountHolder; }
  getNricNumber() { return this.nricNumber; }
  getBalance() { return this.balance; }
  getDebitCardNumber() { return this.debitCardNumber; }

  authenticate(pw: string) { return this.password === pw; }
  setPassword(pw: string) { this.password = pw; }

  deposit(amount: number) {
    if (amount > 0) {
      this.balance += amount;
      console.log(`Deposited RM${amount}`);
      console.log(`Balance: RM${this.balance.toFixed(2)}`);
    } else console.log("Invalid amount");
  }

  withdraw(amount: number) {
    if (amount > 0 && amount <= this.balance) {
      this.balance -= amount;
      console.log(`Withdrawn RM${amount}`);
      console.log(`Balance: RM${this.balance.toFixed(2)}`);
    } else console.log("Invalid / insufficient balance");
  }

  displayAccountInfo() {
    console.log(`User: ${this.accountHolder}`);
    console.log(`Account No: ${this.accountNumber}`);
    console.log(`NRIC: ${this.nricNumber}`);
    console.log(`Balance: RM${this.balance.toFixed(2)}`);
  }
}

// ─────────────────────────────────────────────────────────
// System state
// ─────────────────────────────────────────────────────────
const accounts = new Map<string, Account>();
let userIdCounter = 1000;

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────
function generateUserId() {
  return "UID" + userIdCounter++;
}

function generateAccountNumber() {
  return randomDigits(10);
}

// ─────────────────────────────────────────────────────────
// Core functions (ASYNC)
// ─────────────────────────────────────────────────────────
async function createAccount() {
  const name = await prompt("Enter name: ");
  const nric = await prompt("Enter NRIC: ");

  const accNo = generateAccountNumber();
  const userId = generateUserId();

  const password = await prompt("Set password: ");

  const acc = new Account(
    userId,
    accNo,
    "CIF001",
    name,
    password,
    randomDigits(16),
    "Visa",
    nric
  );

  accounts.set(accNo, acc);

  console.log("Account created!");
  console.log("Account Number:", accNo);
}

async function login(): Promise<Account | null> {
  const accNo = await prompt("Enter account number: ");
  const acc = accounts.get(accNo);

  if (!acc) {
    console.log("Account not found");
    return null;
  }

  const pw = await prompt("Enter password: ");
  if (acc.authenticate(pw)) {
    console.log("Login successful");
    return acc;
  }

  console.log("Wrong password");
  return null;
}

async function bankingMenu(acc: Account) {
  while (true) {
    console.log("\n1. Deposit");
    console.log("2. Withdraw");
    console.log("3. Balance");
    console.log("4. Info");
    console.log("5. Logout");

    const choice = await prompt("Choose: ");

    switch (choice) {
      case "1":
        acc.deposit(parseFloat(await prompt("Amount: ")));
        break;
      case "2":
        acc.withdraw(parseFloat(await prompt("Amount: ")));
        break;
      case "3":
        console.log("Balance:", acc.getBalance());
        break;
      case "4":
        acc.displayAccountInfo();
        break;
      case "5":
        return;
    }
  }
}

// ─────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────
async function main() {
  while (true) {
    console.log("\n--- OLO BANK ---");
    console.log("1. Login");
    console.log("2. Create Account");
    console.log("3. Exit");

    const choice = await prompt("Enter choice: ");

    switch (choice) {
      case "1": {
        const acc = await login();
        if (acc) await bankingMenu(acc);
        break;
      }
      case "2":
        await createAccount();
        break;
      case "3":
        console.log("Goodbye!");
        rl.close();
        process.exit(0);
    }
  }
}

main();