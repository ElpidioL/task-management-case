import os
import unittest

from selenium import webdriver
from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.chrome.service import Service


BASE_URL = os.getenv("FRONTEND_URL", "http://127.0.0.1:5173")


class FrontendSeleniumSmokeTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        try:
            options = webdriver.ChromeOptions()
            options.add_argument("--headless=new")
            options.add_argument("--window-size=1366,900")

            options.add_argument("--no-sandbox")
            options.add_argument("--disable-dev-shm-usage")
            options.add_argument("--disable-gpu")

            service = Service()
            cls.driver = webdriver.Chrome(service=service, options=options)
            cls.wait = WebDriverWait(cls.driver, 10)

        except WebDriverException as exc:
            raise unittest.SkipTest(f"Selenium/WebDriver indisponivel: {exc}")

    @classmethod
    def tearDownClass(cls):
        if hasattr(cls, "driver"):
            cls.driver.quit()

    def test_redirects_to_login_when_not_authenticated(self):
        self.driver.get(f"{BASE_URL}/tasks")

        heading = self.wait.until(EC.visibility_of_element_located((By.TAG_NAME, "h1")))
        self.assertIn("Task Management", heading.text)

        email_input = self.driver.find_element(By.CSS_SELECTOR, "input[type='email']")
        password_input = self.driver.find_element(By.CSS_SELECTOR, "input[type='password']")
        submit_button = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")

        self.assertTrue(email_input.is_displayed())
        self.assertTrue(password_input.is_displayed())
        self.assertIn("Login", submit_button.text)

    def test_can_toggle_between_login_and_register_modes(self):
        self.driver.get(f"{BASE_URL}/login")

        toggle = self.wait.until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Need an account? Register')]"))
        )
        toggle.click()

        self.wait.until(
            EC.visibility_of_element_located(
                (By.XPATH, "//label[contains(., 'Confirm Password')]//input[@type='password']")
            )
        )

        submit_button = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        self.assertIn("Register", submit_button.text)


if __name__ == "__main__":
    unittest.main()