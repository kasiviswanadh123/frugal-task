import time
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import Select
from webdriver_manager.chrome import ChromeDriverManager

# --- CONFIGURATION ---
# UPDATE THIS PATH TO YOUR HTML FILE
# Example: "C:/Users/Roopendra/Desktop/Frugal_Assignment/index.html"
file_path = os.path.abspath("index.html") 
base_url = f"file:///{file_path}"

# Setup Chrome Driver
options = webdriver.ChromeOptions()
options.add_argument("--start-maximized")
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

def take_screenshot(name):
    timestamp = time.strftime("%Y%m%d-%H%M%S")
    filename = f"{name}_{timestamp}.png"
    driver.save_screenshot(filename)
    print(f"📸 Screenshot saved: {filename}")

try:
    print("🚀 Starting Automation Test...")
    
    # 1. Launch the Web Page [cite: 163]
    driver.get(base_url)
    time.sleep(2)
    print(f"✅ Page Loaded. Title: {driver.title}")
    print(f"🔗 URL: {driver.current_url}")

    # ==========================================
    # FLOW A: NEGATIVE SCENARIO [cite: 162]
    # ==========================================
    print("\n🔹 Executing Flow A: Negative Scenario...")
    
    # Fill First Name only
    driver.find_element(By.ID, "firstName").send_keys("Roopendra")
    
    # Skip Last Name (Intentional Error) [cite: 167]
    
    # Valid Email & Phone
    driver.find_element(By.ID, "email").send_keys("roopendra@example.com")
    driver.find_element(By.ID, "phone").send_keys("9999988888")
    
    # Select Gender
    driver.find_element(By.CSS_SELECTOR, "input[value='Male']").click()
    
    # Click Submit
    print("   Clicking Submit with missing fields...")
    driver.find_element(By.ID, "submitBtn").click()
    time.sleep(2)
    
    # Validate Error Message [cite: 175]
    error_msg = driver.find_element(By.ID, "error-lastName")
    if error_msg.is_displayed():
        print("✅ Test Passed: Error message displayed for missing Last Name.")
    else:
        print("❌ Test Failed: No error message found.")
        
    # Capture Screenshot [cite: 178]
    take_screenshot("error-state")

    # ==========================================
    # FLOW B: POSITIVE SCENARIO [cite: 179]
    # ==========================================
    print("\n🔹 Executing Flow B: Positive Scenario...")
    
    # Refresh to clear form
    driver.refresh()
    time.sleep(2)
    
    # Fill All Fields Correctly
    driver.find_element(By.ID, "firstName").send_keys("Roopendra")
    driver.find_element(By.ID, "lastName").send_keys("Ganesh")
    driver.find_element(By.ID, "email").send_keys("roopendra@example.com")
    driver.find_element(By.ID, "phone").send_keys("7075623324")
    driver.find_element(By.ID, "age").send_keys("21")
    
    # Gender
    driver.find_element(By.CSS_SELECTOR, "input[value='Male']").click()
    
    # Address
    driver.find_element(By.ID, "address").send_keys("Vadodara, Gujarat")
    
    # Dynamic Dropdowns [cite: 188-189]
    # Select Country -> India
    country = Select(driver.find_element(By.ID, "country"))
    country.select_by_visible_text("India")
    time.sleep(1) # Wait for States to load
    
    # Select State -> Gujarat (Note: Update script.js if Gujarat isn't there, using Maharashtra for demo)
    state = Select(driver.find_element(By.ID, "state"))
    state.select_by_visible_text("Maharashtra") 
    time.sleep(1)
    
    # Select City -> Pune
    city = Select(driver.find_element(By.ID, "city"))
    city.select_by_visible_text("Pune")
    
    # Password Validation [cite: 181]
    driver.find_element(By.ID, "password").send_keys("Test@1234")
    driver.find_element(By.ID, "confirmPassword").send_keys("Test@1234")
    
    # Terms & Conditions [cite: 182]
    driver.find_element(By.ID, "terms").click()
    
    # Submit
    print("   Submitting valid form...")
    driver.find_element(By.ID, "submitBtn").click()
    time.sleep(2)
    
    # Handle Alert (Success Message)
    try:
        alert = driver.switch_to.alert
        print(f"✅ Alert Text: {alert.text}")
        alert.accept()
        print("✅ Registration Successful Alert accepted.")
    except:
        print("❌ No success alert found.")
        
    # Capture Screenshot [cite: 186]
    take_screenshot("success-state")

    print("\n✅ Automation Completed Successfully.")

except Exception as e:
    print(f"❌ An error occurred: {e}")

finally:
    # Keep browser open for 5 seconds then close
    time.sleep(5)
    driver.quit()