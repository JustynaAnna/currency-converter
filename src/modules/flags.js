import { fetchDataFromAPI } from "./api.js";
import { currencyPriority } from "./helpers.js";

const flagCache = {};

export const fetchFlagSvg = async (currency) => {
  if (flagCache[currency]) {
    return flagCache[currency];
  }

  const apiURL = `https://restcountries.com/v3.1/currency/${currency}`;
  const flagsSvgData = await fetchDataFromAPI(apiURL);

  let selectedCountryData =
    flagsSvgData.find(
      (country) => country.cca2 === currencyPriority[currency]
    ) || flagsSvgData[0];

  const flagSVG = selectedCountryData.flags.svg;
  const countryName = selectedCountryData.altSpellings[1] || currency;
  flagCache[currency] = { flagSVG, countryName };
  return { flagSVG, countryName };
};

export const displayCountryFlags = async (baseCurrency, targetCurrency) => {
  const updateFlag = async (currency, className, container) => {
    let imgTag = document.querySelector(`.${className}`);
    if (!imgTag) {
      imgTag = document.createElement("img");
      imgTag.classList.add("flag-img", className);
      container.appendChild(imgTag);
    }

    const flagData = await fetchFlagSvg(currency);
    if (flagData) {
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
