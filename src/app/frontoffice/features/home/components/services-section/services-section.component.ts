import { Component } from '@angular/core';
interface Service {
  icon: string;
  title: string;
  description: string;
  route: string;
}
@Component({
  selector: 'app-services-section',
  templateUrl: './services-section.component.html',
  styleUrl: './services-section.component.css'
})
export class ServicesSectionComponent {
   services: Service[] = [
    {
      icon: '🚗',
      title: 'Transport Services',
      description: 'Book reliable transportation to your camping destination with our trusted partners',
      route: '/transport'
    },
    {
      icon: '🛒',
      title: 'Marketplace',
      description: 'Buy and sell camping equipment, gear, and supplies from fellow campers',
      route: '/marketplace'
    },
    {
      icon: '🏕️',
      title: 'Campgrounds & Forum',
      description: 'Discover campgrounds, read reviews, and connect with the camping community',
      route: '/campgrounds-forum'
    },
    {
      icon: '🔧',
      title: 'Rent & Maintenance',
      description: 'Rent quality camping equipment or get your gear serviced by professionals',
      route: '/rent-maintenance'
    },
    {
      icon: '📦',
      title: 'Delivery Services',
      description: 'Get your camping supplies delivered directly to your campsite',
      route: '/delivery'
    },
    {
      icon: '🤝',
      title: 'Partnerships',
      description: 'Collaborate with us and join our network of camping service providers',
      route: '/partnerships'
    }
  ];

}
