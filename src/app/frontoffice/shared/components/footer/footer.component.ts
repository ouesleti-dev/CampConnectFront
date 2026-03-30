import { Component } from '@angular/core';
interface FooterLink {
  label: string;
  route: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}
@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  footerSections: FooterSection[] = [
    {
      title: 'Services',
      links: [
        { label: 'Transport', route: '/transport' },
        { label: 'Marketplace', route: '/marketplace' },
        { label: 'Rent & Maintenance', route: '/rent-maintenance' },
        { label: 'Delivery', route: '/delivery' }
      ]
    },
    {
      title: 'Community',
      links: [
        { label: 'Campgrounds & Forum', route: '/campgrounds-forum' },
        { label: 'Partnerships', route: '/partnerships' },
        { label: 'Explore', route: '/explore' }
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', route: '/about' },
        { label: 'Contact', route: '/contact' },
        { label: 'Careers', route: '/careers' },
        { label: 'Blog', route: '/blog' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', route: '/privacy' },
        { label: 'Terms of Service', route: '/terms' },
        { label: 'Cookie Policy', route: '/cookies' }
      ]
    }
  ];

  socialLinks = [
    { name: 'Facebook', icon: 'facebook', url: '#' },
    { name: 'Twitter', icon: 'twitter', url: '#' },
    { name: 'Instagram', icon: 'instagram', url: '#' },
    { name: 'LinkedIn', icon: 'linkedin', url: '#' }
  ];

}
