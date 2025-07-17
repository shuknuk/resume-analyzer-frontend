# ✨ Intelligent Resume Analyzer - Frontend

This repository contains the frontend for the Intelligent Resume Analyzer, a full-stack AI agent that provides hyper-personalized feedback on resumes. This application is built with Next.js and provides a clean, responsive, and intuitive user interface for interacting with the AI agent.

[**➡️ View the Live Application**](https://ranalyzer.vercel.app/)

<!-- It's a great idea to add a screenshot of your app here! -->

## Features

* **Dynamic UI:** A responsive, single-page application built with a modern sidebar and dashboard layout.
* **Contextual Inputs:** Text areas for the resume, job description, and company name to provide rich context to the AI agent.
* **Polished UX:** Includes features like a dark/light mode toggle, toast notifications for status updates, and a detailed help modal.
* **Actionable Results:** Displays the AI's feedback in a structured and easy-to-digest format, using cards and an accordion for detailed improvements.
* **Agent Log Viewer:** A special dialog that allows users to see the agent's "thought process," including the web searches it performed.
* **Report Download:** Users can download their analysis as a neatly formatted `.txt` file.

## Tech Stack

* **Framework:** [Next.js](https://nextjs.org/) (React)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
* **Deployment:** [Vercel](https://vercel.com/)

## Running Locally

To run this project on your local machine, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/shuknuk/resume-analyzer-frontend.git](https://github.com/shuknuk/resume-analyzer-frontend.git)
    cd resume-analyzer-frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root of the project and add the URL for your local backend server:
    ```
    NEXT_PUBLIC_API_URL=http://localhost:8000
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:3000`.

### Backend Repository

The AI agent's core logic, built with Python and LangChain, is located in the backend repository.

[**➡️ View Backend Repo**](https://github.com/shuknuk/resume-analyzer)

>
> You can read a full case study detailing the architecture, challenges, and key learnings from this project on my personal portfolio.
>
> [**➡️ Read the Case Study at kinshuk-goel.vercel.app**](https://kinshuk-goel.vercel.app/)