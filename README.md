# Remix-quirrel-reminders

![image](https://github.com/user-attachments/assets/f0dc6395-bc04-4e39-a92b-e3c0f6393f40)

## Development

Start postgres server and run drizzle-kit migrations:

```shellscript
docker compose up -d
pnpm drizzle-kit migrate
```

Run the dev server along with Quirrel dev instance:

```shellscript
pnpm i
pnpm run dev
```
