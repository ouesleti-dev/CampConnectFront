import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should store token on login', () => {
    const mockResponse = {
      token: '1'
    };

    service.login({
      email: 'test@mail.com',
      password: '123456'
    }).subscribe((res: any) => {
      expect(res.token).toBe('1');
      expect(localStorage.getItem('token')).toBe('1');
    });

    const req = httpMock.expectOne(req => req.method === 'POST');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });
});