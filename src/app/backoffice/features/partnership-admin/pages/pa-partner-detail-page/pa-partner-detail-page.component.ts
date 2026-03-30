import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Camping, Contrat, Offre, QuizPartenaire } from '../../models/partnership.models';
import { PartnershipStoreService } from '../../services/partnership-store.service';

@Component({
  selector: 'app-pa-partner-detail-page',
  templateUrl: './pa-partner-detail-page.component.html',
})
export class PaPartnerDetailPageComponent implements OnInit, OnDestroy {
  partnerId!: number;
  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  score = 0;
  actif = false;
  campings: Camping[] = [];
  offres: Offre[] = [];
  contrats: Contrat[] = [];
  quizzes: QuizPartenaire[] = [];

  private sub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private store: PartnershipStoreService,
  ) {}

  ngOnInit(): void {
    this.sub = this.route.paramMap
      .pipe(switchMap((pm) => {
        this.partnerId = Number(pm.get('id'));
        return this.store.observe();
      }))
      .subscribe(() => this.refresh());
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private refresh(): void {
    const s = this.store.snapshot();
    const u = s.users.find((x) => x.id === this.partnerId);
    if (!u) return;
    this.firstName = u.firstName;
    this.lastName = u.lastName;
    this.email = u.email;
    this.phone = u.phone;
    this.score = u.score;
    this.actif = u.actif;
    this.campings = s.campings.filter((c) => c.partnerIds.includes(this.partnerId));
    const campIds = new Set(this.campings.map((c) => c.id));
    this.offres = s.offres.filter((o) => campIds.has(o.campingId));
    this.contrats = s.contrats.filter((c) => c.partenaireId === this.partnerId);
    this.quizzes = s.quizzes.filter((q) => q.partenaireId === this.partnerId);
  }
}
