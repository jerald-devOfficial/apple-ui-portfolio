import { format, isToday, isThisYear, differenceInHours } from 'date-fns';

export const arrGenerator = (val: number): number[] =>
  Array.from({ length: val }, (_, i) => i + 1)

export const getInitials = (fullName: string) => {
  // Split the full name into an array of words
  const words = fullName.split(' ')

  // Initialize an empty string to store initials
  let initials = ''

  // Iterate over each word
  words.forEach((word) => {
    // Get the first character of each word and add it to the initials string
    initials += word.charAt(0)
  })

  // Return the initials string in uppercase
  return initials.toUpperCase()
}

 
export const getRandomHexColor =() => {
  // Generate a random hexadecimal color code
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);
  // Ensure the color code has 6 digits by padding with zeros if necessary
  return randomColor.padStart(6, '0');
}

export const generatePlaceholderURL = (width: string, height: string, initials: string) => {
  // Generate two random hex colors
  const color1 = getRandomHexColor();
  const color2 = getRandomHexColor();
  
  // Construct the placeholder URL with the generated colors and encoded initials
  const placeholderURL = `https://placehold.co/${(width)}x${(height)}/${(color1)}/${(color2)}?text=${(initials)}`
  
  return placeholderURL;
}

export const hoursAgo = (time: Date) => differenceInHours(new Date(), new Date(time));


export const formatDate = (createdAt: Date) => {
  const parsedDate = new Date(createdAt);
  
  if (isToday(parsedDate)) {
    // Format time for today's mails
    return format(parsedDate, 'h:mm a');
  } else if (isThisYear(parsedDate)) {
    // Format date for mails within the current year
    return format(parsedDate, 'MMM d');
  } else {
    // Format date for mails outside the current year
    return format(parsedDate, 'MM/d/yy');
  }
};

export const fetchExchangeRateFromAPI = async (
  from: string,
  to: string
): Promise<number> => {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${from}&vs_currencies=${to}`
    )
    const data = await response.json()
    const exchangeRate = data[from.toLowerCase()][to.toLowerCase()]
    return exchangeRate
  } catch (error) {
    console.error('Error fetching exchange rate:', error)
    return 0
  }
}

export const classNames = (...classes: string[])  => {
  return classes.filter(Boolean).join(' ')
}

export const formatEthValue = (value: number): string => {
  // Convert value to string and split it into integer and decimal parts
  const [integerPart, decimalPart] = value.toString().split('.');

  // If there is no decimal part or if it's shorter than 4 digits, return the original value
  if (!decimalPart || decimalPart.length <= 4) {
    return value.toFixed(4);
  }

  // Otherwise, return the first 4 digits of the decimal part appended to the integer part
  return `${integerPart}.${decimalPart.slice(0, 4)}`;
};


export const hashShortener = (hash: string, limiterStart: number, limiterEnd?: number ): string  => {
  return hash.slice(0, limiterStart) + '...' + hash.slice(-(limiterEnd ?? limiterStart))
}

export const toFixedFour = (val: number | string): string => {
  if (typeof val === 'number') {
    return val.toFixed(4);
  } else if (typeof val === 'string') {
    const parsedValue = parseFloat(val);
    if (!isNaN(parsedValue)) {
      return parsedValue.toFixed(4);
    }
  }
  // Return an empty string or throw an error, depending on your requirement
  return '';
};

export const copyAddressToClipboard = (hash: string) => {
  if (hash) {
    navigator.clipboard
      .writeText(hash)
      .then(() => {
        alert('Address copied to clipboard')
      })
      .catch((error) => {
        console.error('Error copying address:', error)
      })
  }
}
