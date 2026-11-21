# Kam Ko Khoji PL · काम को खोजी

A free job board for Nepali people in Poland.

- **Job seekers** search jobs and apply with their name, phone and documents (passport + visa, TRC, or TRC-applied proof).
- **Anyone** can post a job vacancy. Each post waits for admin approval before it goes live, which keeps scams off the site.
- **The admin** (`admin.html`) approves jobs, reads applications, opens documents, and deletes data.

Live address once uploaded: `https://avinashdangol.github.io/kam-ko-khoji/`

---

## Files

| File | What it is |
|---|---|
| `index.html`, `style.css`, `app.js` | The public website |
| `admin.html`, `admin.js` | Your private admin dashboard |
| `config.js` | Your Supabase keys and contact details (**you edit this**) |
| `supabase-setup.sql` | Creates the database and private document storage |
| `assets/cover.png` | Preview image shown when the link is shared on Facebook/WhatsApp |

Until `config.js` is filled in, the site runs in **demo mode**: it shows example jobs and saves nothing.

---

## 1. Put it on your GitHub site (5 min)

1. Open your repo **avinashdangol/avinashdangol.github.io** on GitHub.
2. Click **Add file → Upload files**.
3. Drag in the whole **`kam-ko-khoji`** folder (keep the folder name).
4. Click **Commit changes**.
5. After about 1 minute, open `https://avinashdangol.github.io/kam-ko-khoji/`.

You can add a link to it from your portfolio homepage, for example:

```html
<a href="/kam-ko-khoji/">Kam Ko Khoji PL — jobs in Poland for Nepali people</a>
```

## 2. Make it live with Supabase (free, about 15 min)

GitHub Pages can only show pages. It can't store jobs or documents, so the site uses **Supabase** (free tier) as its database and private file storage.

1. Go to **supabase.com** → sign up → **New project**.
   Choose the region **Central EU (Frankfurt)**, which is closest to Poland and inside the EU (good for GDPR).
2. Open **SQL Editor → New query**, paste all of `supabase-setup.sql`, and click **Run**.
3. Go to **Authentication → Users → Add user** and create your admin login (email + password).
4. Back in the SQL Editor, run this with your email:
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'YOUR-EMAIL@example.com';
   ```
5. Go to **Authentication → Sign In / Providers → Email** and turn **off** "Allow new users to sign up".
6. Go to **Project Settings → API** and copy the **Project URL** and the **anon public** key.
7. Paste them into `config.js` (also add your WhatsApp number and email), then upload `config.js` to GitHub again.

The **anon** key is safe to publish, because the database rules decide what visitors can do. **Never** put the `service_role` key on the website.

## 3. Daily use

- Open `…/kam-ko-khoji/admin.html` and log in.
- **Pending jobs**: check each post, then click Approve or Reject. Approved jobs stay live for 30 days. Use **+30 days** to extend one.
- **Applications**: open the documents (each link works for 5 minutes), call the person, forward the application to the employer, and update the status.
- **Delete** an application to remove it together with its documents.

## Security & privacy (what protects your users)

- Passport, visa and TRC files go to a **private** storage bucket. Visitors can upload files but can never list or open them. Only the admin can.
- Phone numbers and emails of job posters are never sent to the public site.
- Jobs only appear after the admin approves them, and they expire automatically after 30 days.
- A hidden "honeypot" field blocks simple spam bots.
- Uploads are limited to PDF, JPG and PNG files, maximum 5 MB each and 3 files per application.
- **GDPR**: you are the data controller. Delete applications after 90 days (see the end of the SQL file), and delete them sooner if someone asks.
