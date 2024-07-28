export const currencyPriority = {
  GBP: "GB",
  USD: "US",
  AUD: "AU",
  EUR: "NL",
};

export const validateInputAmount = () => {
  const baseAmountInput = document.querySelector(".input-amount-from");
  const inputValue = baseAmountInput.value;
  const isValid = /^[0-9]*([.,][0-9]*)?$/.test(inputValue);
  const errorMessage = document.querySelector(".input-error");
  if (!isValid) {
    errorMessage.style.display = "block";
    errorMessage.textContent = "Numbers only. Please enter a valid amount.";
  } else {
    errorMessage.textContent = "";
    errorMessage.style.display = "none";
  }
};

export const createCurrencyOptionElement = (currencyCode, element) => {
  const option = document.createElement("option");
  option.value = currencyCode;
  option.textContent = currencyCode;
  element.appendChild(option);
};
