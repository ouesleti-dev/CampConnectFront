import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function validationMessage(errors: ValidationErrors | null | undefined): string {
  if (!errors) return '';
  if (errors['required']) return 'Ce champ est obligatoire.';
  if (errors['email']) return 'Adresse email invalide.';
  if (errors['min']) return `La valeur doit être supérieure ou égale à ${errors['min'].min}.`;
  if (errors['max']) return `La valeur doit être inférieure ou égale à ${errors['max'].max}.`;
  if (errors['minlength'])
    return `Saisissez au moins ${errors['minlength'].requiredLength} caractères.`;
  if (errors['maxlength'])
    return `Maximum ${errors['maxlength'].requiredLength} caractères.`;
  if (errors['pattern']) return 'Le format saisi est invalide.';
  if (errors['dateOrder']) return 'La date de fin doit être après la date de début.';
  if (errors['jsonInvalid']) return 'Indiquez un tableau JSON valide, ex. ["Option A","Option B"].';
  return 'Valeur invalide.';
}

export function showFieldError(c: AbstractControl | null): boolean {
  return !!(c && c.invalid && (c.dirty || c.touched));
}

/** Contrat : date fin >= date début (champs yyyy-MM-dd). */
export function contratDateOrderValidator(group: AbstractControl): ValidationErrors | null {
  const d1 = group.get('dateDebut')?.value;
  const d2 = group.get('dateFin')?.value;
  if (!d1 || !d2) return null;
  if (String(d1) > String(d2)) return { dateOrder: true };
  return null;
}

/** Si le champ est rempli, doit être un JSON tableau. */
export function optionalJsonArrayValidator(control: AbstractControl): ValidationErrors | null {
  const v = (control.value ?? '').toString().trim();
  if (!v) return null;
  try {
    const x = JSON.parse(v);
    if (!Array.isArray(x)) return { jsonInvalid: true };
    return null;
  } catch {
    return { jsonInvalid: true };
  }
}

export const PHONE_PATTERN = /^[\d\s+().-]{8,22}$/;
