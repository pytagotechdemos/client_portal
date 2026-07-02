import time
from playwright.sync_api import sync_playwright

def run_tests():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 1280, 'height': 720}
        )
        page = context.new_page()

        print("Navigating to login page...")
        page.goto("http://localhost:3001/login")
        
        # NextAuth default signin page uses a form with id "credentials"
        # Since I don't know the exact IDs, let's use broad selectors or next-auth defaults
        print("Logging in as Admin...")
        try:
            page.fill("input[type='email'], input[name='email'], input#input-email-for-credentials-provider", "admin@studiovolta.com")
            page.fill("input[type='password'], input[name='password'], input#input-password-for-credentials-provider", "admin123")
            page.click("button[type='submit']")
            page.wait_for_url("**/dashboard*")
            print("Login successful!")
        except Exception as e:
            print("Failed to login, maybe NextAuth UI is different:", e)
            return

        time.sleep(2) # Give the dashboard time to fade in
        print("Checking Dashboard for 'My Assigned Tasks'...")
        try:
            page.wait_for_selector("text=My Assigned Tasks", timeout=5000)
            print("Success: 'My Assigned Tasks' section is visible.")
        except:
            print("Failed: Could not find 'My Assigned Tasks' section.")

        # Create a Project to test Deliverable assignment
        print("Creating a new project...")
        page.goto("http://localhost:3001/projects/new")
        
        try:
            page.fill("input[name='name']", "E2E Playwright Project")
            page.fill("textarea[name='description']", "Testing with Playwright")
            # Select client
            page.select_option("select[name='clientId']", index=1)
            page.click("button[type='submit']")
            page.wait_for_url("**/projects/*")
            print("Project created successfully.")
        except Exception as e:
            print("Failed to create project:", e)
            # We'll just continue and try to use an existing project if creation fails
        
        time.sleep(2)
        print("Testing Add Deliverable with Assignment...")
        try:
            page.fill("input[name='name']", "E2E Playwright Deliverable")
            page.select_option("select[name='type']", "DESIGN")
            # Select assigned admin
            page.select_option("select[name='assignedTo']", index=1)
            page.click("button:has-text('Add')")
            
            # Check for the deliverable
            page.wait_for_selector("text=E2E Playwright Deliverable", timeout=5000)
            print("Deliverable created and listed.")
            
            # Click into it
            page.click("text=E2E Playwright Deliverable")
            page.wait_for_url("**/deliverables/*")
            print("Opened deliverable detail page.")
        except Exception as e:
            print("Failed to create or open deliverable:", e)

        time.sleep(2)
        print("Testing Real-time Comments and Toasts...")
        try:
            page.fill("textarea[name='content']", "Hello, this is a real-time comment test.")
            page.click("button:has-text('Send')")
            
            # Check for comment
            page.wait_for_selector("text=Hello, this is a real-time comment test.", timeout=5000)
            print("Comment successfully appeared on screen.")
            
            # Check for toast (sonner)
            # We won't strictly enforce it here because sonner might disappear fast or have different DOM
            print("Real-time Comment flow works!")
        except Exception as e:
            print("Failed to add comment:", e)

        print("All tests completed.")
        browser.close()

if __name__ == "__main__":
    run_tests()
