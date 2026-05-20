import { Client, Account } from "appwrite";

const client = new Client();
client.setEndpoint('https://nyc.cloud.appwrite.io/v1');
client.setProject('6a0cc03700054f6ab4dc');

const account = new Account(client);

export { account }
