# AI-LOG.md - Artificial Intelligence Usage Report

**Project Name:** Cosmic Watch: Interstellar Asteroid Tracker  
**Date:** February 8, 2026  

## 1. Media & Assets Generation
* **Tools Used:** Google Whisk, Google Flow, Google Veo
* **Usage Description:** All the animations, pictures, and visual assets used in this project are generated using Google Whisk, Google Flow, and Google Veo. These tools were utilized to create immersive space-themed backgrounds and 3D-style visual elements for the "Cosmo Scan" dashboard to enhance the user experience without relying on copyrighted external assets.

## 2. Code Assistance & Development
* **Tools Used:** [e.g., GitHub Copilot, Gemini Code Assist]
* **Scope of Assistance:** AI was used strictly as an assistive tool to accelerate development, not to replace core logic.
    * **Boilerplate Generation:** Used to generate the initial `Dockerfile` and `docker-compose.yml` structures to ensure syntax accuracy for containerization.
    * **Debugging:** Used to analyze stack traces during the integration of the NASA NeoWs API (specifically for handling pagination errors).
    * **Refactoring:** Assisted in converting raw CSS to Tailwind utility classes for the "Space Theme" UI requirements.
* **Human Verification:** All AI-generated code snippets were manually reviewed, tested, and modified by the team to fit the specific architecture of this project.

## 3. Documentation & API Testing
* **Tools Used:** [e.g., Postman AI]
* **Usage Description:**
    * **API Documentation:** AI was used to draft descriptions for the Postman Collection endpoints to ensure clarity and standard formatting.

## 4. Research & Ideation
* **Tools Used:** [e.g., Gemini, Perplexity]
* **Usage Description:**
    * Used to understand the specific data fields returned by the NASA NeoWs API (e.g., understanding the difference between `close_approach_data` and `orbital_data`).
    * Used to brainstorm calculations for the "Risk Analysis Engine" (specifically how to weight asteroid diameter vs. velocity for a custom risk score).

---
**Declaration:**
We certify that the core logic, architecture, and final implementation of "Cosmic Watch" are the original work of the team. AI tools were used solely to enhance productivity, generate assets, and debug issues in accordance with the hackathon rules.
