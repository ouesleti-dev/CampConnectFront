import {
  sliceDate,
  mapOffreStatutToApi,
  mapOffreStatutFromApi,
  mapContratStatutToApi,
  mapContratStatutFromApi,
  mapDecisionToApi,
  mapDecisionFromApi,
  mapRencontreModeToApi,
  mapRencontreModeFromApi,
  mapQuestionTypeToApi,
  mapQuestionTypeFromApi,
  mapUsersFromApi,
  buildPartnerUserWriteBody,
  mapCampingsFromApi,
  mapOffersFromApi,
  mapContratsFromApi,
  patchContratMontants,
  mapReponsesFromApi,
  buildCreateOfferBody,
  buildUpdateOfferBody,
} from './partnership-mapper';

describe('Partnership Mapper', () => {

  // ===============================
  // ✅ sliceDate
  // ===============================
  it('should slice date correctly', () => {
    expect(sliceDate('2026-03-01T10:00:00')).toBe('2026-03-01');
    expect(sliceDate(undefined)).toBe('');
  });

  // ===============================
  // ✅ Offre Statut
  // ===============================
  it('should map offre statut to API', () => {
    expect(mapOffreStatutToApi('PROPOSEE')).toBe('PROPOSED');
  });

  it('should map offre statut from API', () => {
    expect(mapOffreStatutFromApi('ACCEPTED')).toBe('ACCEPTEE');
  });

  it('should fallback offre statut', () => {
    expect(mapOffreStatutFromApi('UNKNOWN')).toBe('PROPOSEE');
  });

  // ===============================
  // ✅ Contrat Statut
  // ===============================
  it('should map contrat statut', () => {
    expect(mapContratStatutToApi('EN_COURS')).toBe('IN_PROGRESS');
    expect(mapContratStatutFromApi('TERMINATED')).toBe('RESILIE');
  });

  // ===============================
  // ✅ Decision
  // ===============================
  it('should map decision', () => {
    expect(mapDecisionToApi('VALIDER')).toBe('VALIDATE');
    expect(mapDecisionFromApi('REFUSE')).toBe('REFUSER');
  });

  // ===============================
  // ✅ Mode rencontre
  // ===============================
  it('should map mode', () => {
    expect(mapRencontreModeToApi('VISIO')).toBe('VIDEO');
    expect(mapRencontreModeFromApi('PHONE')).toBe('TELEPHONE');
  });

  // ===============================
  // ✅ Question type
  // ===============================
  it('should map question type', () => {
    expect(mapQuestionTypeToApi('QCM')).toBe('MCQ');
    expect(mapQuestionTypeFromApi('YES_NO')).toBe('OUI_NON');
  });

  // ===============================
  // ✅ Users mapping
  // ===============================
  it('should map users from API', () => {
    const api = [{
      id: 1,
      firstName: 'Ali',
      lastName: null,
      email: null,
      phone: null,
      score: null,
      actif: null
    }];

    const result = mapUsersFromApi(api as any);

    expect(result[0].firstName).toBe('Ali');
    expect(result[0].lastName).toBe('');
    expect(result[0].score).toBe(0);
    expect(result[0].actif).toBeTrue();
  });

  // ===============================
  // ✅ buildPartnerUserWriteBody
  // ===============================
  it('should build user body with password', () => {
    const body = buildPartnerUserWriteBody({
      firstName: 'Ali',
      lastName: 'Test',
      email: 'a@test.com',
      phone: '123',
      score: 0,
      actif: true,
      password: ' 1234 '
    });

    expect(body.password).toBe('1234');
  });

  it('should not include empty password', () => {
    const body = buildPartnerUserWriteBody({
      firstName: 'Ali',
      lastName: 'Test',
      email: 'a@test.com',
      phone: '123',
      score: 0,
      actif: true,
      password: ' '
    });

    expect(body.password).toBeUndefined();
  });

  // ===============================
  // ✅ Campings mapping
  // ===============================
  it('should map campings', () => {
    const api = [{
      campingId: 1,
      name: 'Camp',
      localisation: 'TN',
      capacite: 100,
      partnerIds: [1]
    }];

    const result = mapCampingsFromApi(api);

    expect(result[0].nom).toBe('Camp');
    expect(result[0].partnerIds.length).toBe(1);
  });

  // ===============================
  // ✅ Offers mapping
  // ===============================
  it('should map offers', () => {
    const api = [{
      offerId: 1,
      title: 'Offer',
      description: 'desc',
      startDate: '2026-01-01T00:00:00',
      endDate: '2026-01-02',
      price: 200,
      status: 'PROPOSED'
    }];

    const result = mapOffersFromApi(api as any);

    expect(result[0].titre).toBe('Offer');
    expect(result[0].statut).toBe('PROPOSEE');
  });

  // ===============================
  // ✅ Contrats mapping + patch
  // ===============================
  it('should map contrats and patch montant', () => {
    const contrats = mapContratsFromApi([{
      contractId: 1,
      startDate: '2026-01-01',
      endDate: '2026-02-01',
      commission: 10,
      status: 'IN_PROGRESS',
      offerId: 5
    }]);

    const offres = [{
      id: 5,
      titre: '',
      description: '',
      campingId: 0,
      datePublication: '',
      statut: 'PROPOSEE',
      price: 300
    }];

    const patched = patchContratMontants(contrats, offres as any);

    expect(patched[0].montant).toBe(300);
  });

  // ===============================
  // ✅ Reponses mapping
  // ===============================
  it('should map reponses with relations', () => {
    const responses = [{
      responseId: 1,
      value: 'yes',
      grade: 10,
      questionId: 2
    }];

    const questions = [{
      id: 2,
      quizId: 3
    }];

    const quizzes = [{
      id: 3,
      partenaireId: 99
    }];

    const result = mapReponsesFromApi(
      responses as any,
      questions as any,
      quizzes as any
    );

    expect(result[0].partenaireId).toBe(99);
  });

  // ===============================
  // ✅ Offer builders
  // ===============================
  it('should build create offer body', () => {
    const body = buildCreateOfferBody({
      titre: 'Offer',
      description: '',
      campingId: 0,
      datePublication: '2026-01-01',
      statut: 'PROPOSEE',
      price: 0
    });

    expect(body['status']).toBe('PROPOSED');
  });

  it('should build update offer body', () => {
    const body = buildUpdateOfferBody({
      id: 1,
      titre: 'Offer',
      description: '',
      campingId: 0,
      datePublication: '2026-01-01',
      statut: 'PROPOSEE',
      price: 500
    });

    expect(body['offerId']).toBe(1);
    expect(body['price']).toBe(500);
  });

});