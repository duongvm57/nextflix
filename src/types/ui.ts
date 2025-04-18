import { ReactNode } from 'react';

/**
 * Base props for all components
 */
export interface IBaseProps {
  className?: string;
  children?: ReactNode;
}

/**
 * Props with ID
 */
export interface IWithIdProps extends IBaseProps {
  id?: string;
}

/**
 * Button variants
 */
export type ButtonVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'link'
  | 'destructive';

/**
 * Button sizes
 */
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

/**
 * Button props
 */
export interface IButtonProps extends IWithIdProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

/**
 * Card props
 */
export interface ICardProps extends IBaseProps {
  title?: string;
  description?: string;
  image?: string;
  href?: string;
  footer?: ReactNode;
  header?: ReactNode;
}

/**
 * Modal props
 */
export interface IModalProps extends IBaseProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  footer?: ReactNode;
}

/**
 * Form field props
 */
export interface IFormFieldProps extends IWithIdProps {
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

/**
 * Input props
 */
export interface IInputProps extends IFormFieldProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

/**
 * Select option
 */
export interface ISelectOption {
  label: string;
  value: string;
}

/**
 * Select props
 */
export interface ISelectProps extends IFormFieldProps {
  options: ISelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}
