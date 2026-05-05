import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { ToastrService } from 'ngx-toastr';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.css']
})
export class DashboardPageComponent implements OnInit, AfterViewInit {
  @ViewChild('analyticsChart') analyticsChartRef!: ElementRef;
  @ViewChild('progressChart') progressChartRef!: ElementRef;

  totalProjects = 24;
  endedProjects = 10;
  runningProjects = 12;
  pendingProjects = 2;

  teamMembers = [
    { name: 'Alexandre Zott', role: 'Head of Project', progress: 75, avatar: 'https://ui-avatars.com/api/?name=AZ&background=f4f6f8' },
    { name: 'Ethan Davies', role: 'Head of Developer', progress: 60, avatar: 'https://ui-avatars.com/api/?name=ED&background=e6f0eb' },
    { name: 'Julia Chmielewski', role: 'Senior Developer', progress: 40, avatar: 'https://ui-avatars.com/api/?name=JC&background=f4f6f8' },
    { name: 'David Climent', role: 'Junior UI/UX', progress: 85, avatar: 'https://ui-avatars.com/api/?name=DC&background=e6f0eb' },
  ];

  recentProjects = [
    { name: 'Device IOS App Design', status: 'Completed', icon: '📱' },
    { name: 'Onboarding App', status: 'In Progress', icon: '🚀' },
    { name: 'Drib Dashboard', status: 'In Progress', icon: '📊' },
    { name: 'Optimize App Level', status: 'Testing', icon: '⚙️' },
    { name: 'Dashboard Testing', status: 'Pending', icon: '🧪' },
  ];

  constructor(private toast: ToastrService) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initAnalyticsChart();
      this.initProgressChart();
    }, 100);
  }

  // --- Button Actions ---
  addProject() { this.toast.info('Feature: Add Project'); }
  importData() { this.toast.info('Feature: Import Data'); }
  startMeeting() { this.toast.success('Meeting started!'); }
  addNewProject() { this.toast.info('Feature: New Project'); }
  addMember() { this.toast.info('Feature: Add Member'); }
  pauseTracker() { this.toast.warning('Time tracker paused'); }
  stopTracker() { this.toast.error('Time tracker stopped'); }

  initAnalyticsChart() {
    if (!this.analyticsChartRef) return;
    new Chart(this.analyticsChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [{
          label: 'Projects',
          data: [12, 19, 15, 25, 22, 30, 20],
          backgroundColor: [
            '#e2e8f0', '#e2e8f0', '#e2e8f0', '#2c8c5c', '#1A5D3A', '#e2e8f0', '#e2e8f0'
          ],
          borderRadius: 20,
          borderSkipped: false,
          barThickness: 24
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1A5D3A',
            padding: 10,
            cornerRadius: 8
          }
        },
        scales: {
          y: { display: false, grid: { display: false } },
          x: { grid: { display: false }, border: { display: false } }
        }
      }
    });
  }

  initProgressChart() {
    if (!this.progressChartRef) return;
    new Chart(this.progressChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Completed', 'Remaining'],
        datasets: [{
          data: [41, 59],
          backgroundColor: ['#1A5D3A', '#f1f5f9'],
          borderWidth: 0
        }]
      },
      options: {
        cutout: '80%',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        layout: { padding: 0 }
      }
    });
  }
}

