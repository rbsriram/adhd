// lib/utils/validation.ts
export const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
  
  export const validateName = (name: string) => {
    const regex = /^[A-Za-zÀ-ÖØ-öø-ÿ'-\s]+$/;
    return regex.test(name.trim()) && name.trim().length > 1;
  }