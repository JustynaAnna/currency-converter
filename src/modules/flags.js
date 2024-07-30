import { fetchDataFromAPI } from "./api.js";

const currencyPriority = {
  GBP: "GB",
  USD: "US",
  AUD: "AU",
};

const flagCache = {};

export const fetchFlagSvg = async (currency) => {
  try {
    //Sprawdzanie, czy flaga dla danej waluty jest już w pamięci podręcznej
    if (flagCache[currency]) {
      console.log(`Flag for currency ${currency} found in cache`);
      return flagCache[currency];
    }
    const apiURL = `https://restcountries.com/v3.1/currency/${currency}`;
    const flagsSvgData = await fetchDataFromAPI(apiURL);
    console.log(flagsSvgData);

    let selectedCountryData;

    if (currencyPriority[currency]) {
      selectedCountryData = flagsSvgData.find(
        (country) => country.cca2 === currencyPriority[currency]
      );
    }

    if (!selectedCountryData) {
      selectedCountryData = flagsSvgData[0];
    }

    if (!flagsSvgData[0]?.flags?.svg) {
      throw new Error(`Flag not found for currency ${currency}.`);
    }
    const flagSVG = selectedCountryData.flags.svg;
    const countryName = selectedCountryData.altSpellings[1] || currency;
    flagCache[currency] = { flagSVG, countryName };
    console.log(countryName);
    return { flagSVG, countryName };
  } catch (error) {
    console.error(error);
    return null; // Zwraca null, aby zamiast rzucenia błędu program mógł nadal się wykonywać
    //z informacją, że brak jest obrazka dla tej waluty. Nie zatrzymam programu
  }
};

export const displayCountryFlags = async (baseCurrency, targetCurrency) => {
  const updateFlag = async (currency, className, container) => {
    const ueFlag = "./src/ueFlag.jpg";
    let imgTag = document.querySelector(`.${className}`);
    if (!imgTag) {
      imgTag = document.createElement("img");
      //wspolna klasa dla img "flag-img", mogę teraz stylizować flagi w CSS
      imgTag.classList.add("flag-img", className);
      container.appendChild(imgTag);
    }

    const flagData = await fetchFlagSvg(currency);
    console.log(flagData);
    if (currency === "EUR") {
      imgTag.src = ueFlag;
    } else if (flagData) {
      imgTag.src = flagData.flagSVG;
      imgTag.alt = flagData.countryName;
    }
  };

  await updateFlag(
    baseCurrency,
    "flag-img-base",
    document.querySelector(".img-wrapper")
  );
  await updateFlag(
    targetCurrency,
    "flag-img-targetCurrency",
    document.querySelector(".img-wrapper-to")
  );
};
