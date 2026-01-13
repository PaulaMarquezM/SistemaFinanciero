export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  children?: NavItem[];
}

export interface User {
  name: string;
  avatar?: string;
  role: string;
}