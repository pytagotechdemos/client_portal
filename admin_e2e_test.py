import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()
        
        try:
            print("Navigating to http://localhost:3000...")
            await page.goto("http://localhost:3000")
            
            print("Waiting for redirect to /api/auth/signin...")
            await page.wait_for_url("**/api/auth/signin*", timeout=5000)
            
            print("Filling in credentials...")
            await page.wait_for_selector('input[name="email"]', timeout=5000)
            await page.fill('input[name="email"]', 'admin@studiovolta.com')
            await page.fill('input[name="password"]', 'admin123')
            
            print("Submitting login form...")
            await page.click('button[type="submit"]')
            
            print("Waiting for navigation to Dashboard...")
            await page.wait_for_load_state('networkidle')
            
            print(f"URL after login: {page.url}")
            
            print("Taking screenshot of dashboard...")
            await page.screenshot(path='admin-dashboard.png', full_page=True)
            print("Screenshot saved to admin-dashboard.png")
            print("Login successful!")
            
        except Exception as e:
            print(f"Test failed: {str(e)}")
            await page.screenshot(path='failure-screenshot.png', full_page=True)
            print("Saved failure screenshot to failure-screenshot.png")
            raise e
        finally:
            await browser.close()

if __name__ == '__main__':
    asyncio.run(run())
