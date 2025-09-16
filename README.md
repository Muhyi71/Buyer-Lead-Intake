# Buyer Lead Intake

A full-stack web application for managing buyer leads with Supabase as the backend and React + Vite + TailwindCSS on the frontend.  
It supports lead intake, editing, import/export, and validation flows for clean data management.

---

## 🚀 Features

- **Buyer Management** – Create, update, edit, and delete buyer leads.  
- **CSV Import/Export** – Bulk add or extract buyers.  
- **Validation** – Strong client + server validation to ensure clean data.  
- **Responsive UI** – Modern design using TailwindCSS.  
- **Supabase Integration** – Real-time database and API layer.

---

## ⚙️ Setup

### 1. Clone the repo
```bash
git clone https://github.com/Muhyi71/Buyer-Lead-Intake.git
cd Buyer-Lead-Intake
2. Install dependencies
bash
Copy code
npm install
3. Environment variables
Create a .env file in the project root with your Supabase keys:

ini
Copy code
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
4. Database migrations
bash
Copy code
npx supabase migration up
5. Run locally
bash
Copy code
npm run dev
🏗️ Design Notes
Validation

Client-side validation with React forms (immediate feedback).

Server-side enforcement using Supabase constraints for consistency.

Ownership Enforcement

Leads are scoped per authenticated user.

Supabase row-level security (RLS) ensures users only access their data.

Rendering

Fully client-side rendered (CSR) with React + Vite.

Future scope: Server-side rendering (SSR) for SEO and performance.

✅ Completed
Buyer CRUD pages (CreateBuyer, EditBuyer, BuyerList)

CSV import/export flows

Validation rules for required fields (name, email, phone)

Supabase migrations & schema setup

Basic responsive UI with Tailwind

⏭️ Skipped / Deferred (with reasons)
Admin role
Deferred to keep scope focused on core user workflows (CRUD + import/export).
Can be added later if multi-level access is required.

File upload for attachments
Considered out of scope for this iteration to avoid storage complexity.
Chose to prioritize CSV import/export instead.

Optimistic updates with rollback
Skipped to keep data consistency strong.
Current flow prioritizes accuracy with server-validated updates.

Advanced full-text search
Left out to keep the search implementation simple and performant.
Current debounced search by name/email/phone covers most use cases.

📌 Future Improvements
Add role-based access control (Admin vs User).

Implement file storage for buyer documents.

Enhance UI with charts & analytics dashboards.

Introduce SSR for performance & SEO.
📫 Contact

GitHub: Muhyi71

LinkedIn: Mohammed Abdul Muhyi

Email: abdulmuhyi755@gmail.com
