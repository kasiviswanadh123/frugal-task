// Data for Dynamic Dropdowns
const locationData = {
    "USA": {
        "California": ["Los Angeles", "San Francisco", "San Diego"],
        "New York": ["New York City", "Buffalo", "Rochester"],
        "Texas": ["Houston", "Austin", "Dallas"]
    },
    "India": {
        "Maharashtra": ["Pune", "Mumbai", "Nagpur"],
        "Karnataka": ["Bangalore", "Mysore", "Hubli"],
        "Delhi": ["New Delhi", "North Delhi", "South Delhi"]
    },
    "UK": {
        "England": ["London", "Manchester", "Liverpool"],
        "Scotland": ["Edinburgh", "Glasgow", "Aberdeen"]
    }
};

// Load Countries on Page Load
window.onload = function() {
    const countrySelect = document.getElementById("country");
    for (let country in locationData) {
        let option = document.createElement("option");
        option.value = country;
        option.text = country;
        countrySelect.add(option);
    }
};

// Load States based on Country
function loadStates() {
    const countrySelect = document.getElementById("country");
    const stateSelect = document.getElementById("state");
    const citySelect = document.getElementById("city");
    
    // Reset Dropdowns
    stateSelect.innerHTML = '<option value="">Select State</option>';
    citySelect.innerHTML = '<option value="">Select City</option>';
    stateSelect.disabled = true;
    citySelect.disabled = true;

    const selectedCountry = countrySelect.value;
    
    if (selectedCountry) {
        const states = Object.keys(locationData[selectedCountry]);
        states.forEach(state => {
            let option = document.createElement("option");
            option.value = state;
            option.text = state;
            stateSelect.add(option);
        });
        stateSelect.disabled = false;
    }
}

// Load Cities based on State
function loadCities() {
    const countrySelect = document.getElementById("country");
    const stateSelect = document.getElementById("state");
    const citySelect = document.getElementById("city");

    // Reset City Dropdown
    citySelect.innerHTML = '<option value="">Select City</option>';
    citySelect.disabled = true;

    const selectedCountry = countrySelect.value;
    const selectedState = stateSelect.value;

    if (selectedCountry && selectedState) {
        const cities = locationData[selectedCountry][selectedState];
        cities.forEach(city => {
            let option = document.createElement("option");
            option.value = city;
            option.text = city;
            citySelect.add(option);
        });
        citySelect.disabled = false;
    }
}

// Password Strength Logic
function checkStrength() {
    const password = document.getElementById("password").value;
    const strengthBar = document.getElementById("strength-fill");
    const strengthText = document.getElementById("strength-text");
    
    let strength = 0;
    if (password.length > 5) strength++;
    if (password.length > 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    let color = "#ddd";
    let width = "0%";
    let text = "";

    if (strength === 0) {
        width = "0%"; text = "";
    } else if (strength <= 2) {
        color = "#ff4757"; width = "30%"; text = "Weak";
    } else if (strength <= 4) {
        color = "#ffa502"; width = "70%"; text = "Medium";
    } else {
        color = "#2ed573"; width = "100%"; text = "Strong";
    }

    strengthBar.style.width = width;
    strengthBar.style.backgroundColor = color;
    strengthText.innerText = "Strength: " + text;
    strengthText.style.color = color;
}

// Form Validation on Submit
function validateForm(event) {
    event.preventDefault(); // Stop refresh
    let isValid = true;

    // Helper to show error
    function showError(id, message) {
        const element = document.getElementById(id);
        const errorSmall = document.getElementById("error-" + id);
        element.classList.add("error-border");
        errorSmall.innerText = message;
        errorSmall.style.display = "block";
        isValid = false;
    }

    // Helper to clear error
    function clearError(id) {
        const element = document.getElementById(id);
        const errorSmall = document.getElementById("error-" + id);
        element.classList.remove("error-border");
        errorSmall.style.display = "none";
    }

    // 1. First Name
    const firstName = document.getElementById("firstName").value;
    if (firstName.trim() === "") showError("firstName", "First Name is required");
    else clearError("firstName");

    // 2. Last Name
    const lastName = document.getElementById("lastName").value;
    if (lastName.trim() === "") showError("lastName", "Last Name is required");
    else clearError("lastName");

    // 3. Email (No disposable domains)
    const email = document.getElementById("email").value;
    const disposableDomains = ["tempmail.com", "10minutemail.com", "mailinator.com"];
    const emailDomain = email.split("@")[1];
    
    if (email.trim() === "") {
        showError("email", "Email is required");
    } else if (!email.includes("@") || !email.includes(".")) {
        showError("email", "Enter a valid email");
    } else if (disposableDomains.includes(emailDomain)) {
        showError("email", "Disposable emails not allowed");
    } else {
        clearError("email");
    }

    // 4. Phone
    const phone = document.getElementById("phone").value;
    if (phone.trim() === "") showError("phone", "Phone is required");
    else if (phone.length < 10) showError("phone", "Invalid phone number");
    else clearError("phone");

    // 5. Gender
    const gender = document.querySelector('input[name="gender"]:checked');
    const genderGroup = document.getElementById("error-gender");
    if (!gender) {
        genderGroup.innerText = "Please select a gender";
        genderGroup.style.display = "block";
        isValid = false;
    } else {
        genderGroup.style.display = "none";
    }

    // 6. Password Match
    const pass = document.getElementById("password").value;
    const confirmPass = document.getElementById("confirmPassword").value;
    
    if (pass === "") showError("password", "Password is required");
    else clearError("password");

    if (confirmPass === "") {
        showError("password", "Confirm Password is required"); 
        // Note: Attaching error to password field area for simplicity or define specific error-confirm
    } else if (pass !== confirmPass) {
        alert("Passwords do not match!"); // Simple alert for mismatch
        isValid = false;
    }

    // 7. Terms
    const terms = document.getElementById("terms").checked;
    const termsError = document.getElementById("error-terms");
    if (!terms) {
        termsError.innerText = "You must accept T&Cs";
        termsError.style.display = "block";
        isValid = false;
    } else {
        termsError.style.display = "none";
    }

    if (isValid) {
        alert("Registration Successful! \nWelcome, " + firstName);
        document.getElementById("registrationForm").reset();
        // Reset bars
        document.getElementById("strength-fill").style.width = "0%";
        document.getElementById("strength-text").innerText = "Strength: ";
    }
}