
export interface PledgeFormData {
  fullName: string;
  referralCode: string;
}

export interface ValidationErrors {
  [key: string]: string;
}

export const validatePledgeForm = (formData: PledgeFormData, userEmail: string | undefined): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!formData.fullName.trim()) {
    errors.fullName = 'Full name is required';
  } else if (formData.fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters';
  }

  if (!userEmail) {
    errors.email = 'Please sign in to make a pledge';
  }

  return errors;
};
