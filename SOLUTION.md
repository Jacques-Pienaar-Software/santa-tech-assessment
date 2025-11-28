Reflection document: Jacques Pienaar - Santa Tech assessment

### My approach:

1. Data modelling:
   I first read through the spec document of what is required and immediately started drawing out an ERD for the database. Knowing roughly what I want the data model to look like sets the scene for all endpoint development, and simplifies the base functionality as well as its extensibility.

2. Tooling I wasn't fully familiar with:
   Then there was tooling that I haven't used much before (Prisma ORM). So I went through the introductory documentation and what would be useful in building the application.
3. After properly familiarizing myself with how Prisma works I set up the codebase and rough folder structure to get a good idea of what I would like to use as tooling in this example (and in a production-ready version of the application). Some features of the codebase are integral to ensuring that the data stays clean, and each section of the app is clear:
   **Zod** for robust model typing (maps nicely onto Prisma models)
   **Proper use of Middleware** to simplify the guarding of endpoints
   **Service classes for business logic** (this could be broken down even more to allow for a proper data layer)
   **Multer** for simplified media uploads
   **Swagger** to easily test the API endpoints
   **Docker** to easily boot up and run the application in every environment.
   **BetterAuth** awesome out-of-the-box authentication tables and standards.
   **Proper error handling** (with status codes)
4. Authentication using BetterAuth:
   After my initial migration with the base Prisma schema I implemented BetterAuth and mapped it to the predefined Users table and enabled its built-in authentication features. Since I already had the relationships between organizations, manager users and songwriter users this was simple.
   I also added the registration and login endpoints at this stage.
5. Endpoint development:
   Then when BetterAuth was set up and functional I started work on the endpoints. Beginning with the Organization creation endpoint allowed me to rapidly develop subsequent endpoints.
   It was important to guard specific endpoints to only allow each user to do what they're supposed to:
   Everyone can:
   - Register
   - Log in
   - View their Profile

   Songwriters can:
   - Upload songs
   - View invites to organizations
   - Accept or Reject Invites to Organizations
   - View Pitches made on Media that they belong to.

   Managers can:
   - Create Organizations.
   - Update Organizations.
   - Delete Organizations.
   - Invite Artists to Organizations.
   - Create Pitches on Media within an Organization.
   - Delete Pitches on Media within an Organization.

6. Documentation
   This is the step that I am on as I am typing this. Finally writing out the README.md, SOLUTION.md, and this reflection document.

### AI Usage:

To preface this section, it's important to note that AI is not yet what some AI companies promise it could be. I see AI as another (potentially very powerful) tool in my toolset. Sometimes AI provides me with the most inspired code I've ever read, and other times it's like a robot walking into a mirror over and over again because it believes that the robot on the other side has deeply insulted it's firmware.

The hands that wield the tool of AI are what defines the usefulness of it.
Over the course of coding this project I used ChatGPT and Gemini. Mainly because I already have a ChatGPT pro subscription.

As soon as the architecture was laid out using Prisma I was able to quickly utilize ChatGPT to rapidly develop the API endpoints. Giving it the context that it required to return the correct Swagger definitions and even service layer code at points sped up development a lot. Also checking my Prisma schema with ChatGPT gave me some peace of mind.

Because LLMs are ultimately predictive models we can expect that with the right context they can give the most standardized code for most generic CRUD endpoints. When it comes to obscure technologies and more complex issues it simply cannot keep up to humans, for now.

### Database Design:

When I start a new application I take out a pen and paper and draw out an ERD (I know - old school).

###### User:

Starting with the Users table I knew that it was important to define what an app user looks like from the top and then work back down to define their relationships that way.

###### Organization:

After that I went to the Organization table, which had a few iterations. Firstly I created a join/pivot table to store metadata with regards to organization members as Songwriters or Managers. I decided against this and instead just added an enum to define the roles of a user, since adding join tables for this would not enhance the data model down the road, and possibly complicate auth.

with a composite key on userId and orgId we ensure that a user can't be added to an organization twice.

###### Media and Authors:

Media belongs to only one Organization. This allows for a piece of media to only be affected by Managers and Songwriters that belong to it.

###### Pitches, Tags, and Target Authors:

A pitch creator/commenter is a member of an organization, ensuring that pitches are only made by members of a given organization. Multiple tags are allowed for pitches, currently represented as an array of strings for simplicity, but easily extendable to a dedicated Tags table

**Auth tables:**
Auth tables were auto generated by BetterAuth in the Prisma schema, and I hardly touched it.

### Trade-offs:

###### Data model simplification

- Assuming that a member of an organization can only be a Manager or Songwriter will require some migration later on if multiple roles per user might be required.
- There are no soft deletes.
- Media can only be owned by one organization.
- Duration of Media is a string instead of inferred field.

### Improvements

- **Finer grained auth** using permissions along with roles, to allow for other organizational roles to be added and managed (i.e. engineers, external collaborators, account managers, etc.)
- **Client, branding, and project management tooling** for managers so that single songs can be put into projects that can be grown into full albums and campaigns. This could also include integration with project management tools and note taking tools like Monday.com or Notion.
- **Publisher integration** for when a project is complete to seamlessly deploy it to Spotify, Apple Music, YouTube Music, etc.
- **Version management for songs** to allow for an audit trail of the progress of a song.
- **Legal document generation** so that Organizations can reach out with contracts and invoices to their songwriters and external collaborators.

### Challenges

Learning a new ORM:
I haven't used Prisma much before, so to implement this database took some trial and error, but I got it pretty quickly since ORMs are not often very different from each other. It was fun to learn, and it simplified a lot of the foot-gun boilerplate that SQL often uses/requires.
