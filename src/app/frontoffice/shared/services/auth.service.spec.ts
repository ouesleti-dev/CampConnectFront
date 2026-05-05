import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
<<<<<<< HEAD
      imports: [HttpClientTestingModule]
    });

=======
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
>>>>>>> origin/Marketplace-and-delivery
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

<<<<<<< HEAD
  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
=======
  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
>>>>>>> origin/Marketplace-and-delivery
  });

  it('should store token on login', () => {
    const mockResponse = {
<<<<<<< HEAD
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
=======
      token: 'jwt123',
      email: 'test@test.com',
      role: 'ROLE_ADMIN',
      idUser: 1
    };

    service.login({ email: 'test@test.com', password: '123456' }).subscribe(() => {
      expect(localStorage.getItem('token')).toBe('jwt123');
      expect(localStorage.getItem('email')).toBe('test@test.com');
      expect(localStorage.getItem('role')).toBe('ROLE_ADMIN');
      expect(localStorage.getItem('idUser')).toBe('1');
    });

    const req = httpMock.expectOne('http://localhost:8088/campConnect/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should return token from localStorage', () => {
    localStorage.setItem('token', 'mytoken');
    expect(service.getToken()).toBe('mytoken');
  });

  it('should return true when logged in', () => {
    localStorage.setItem('token', 'mytoken');
    expect(service.isLoggedIn()).toBeTrue();
  });

  it('should return false when not logged in', () => {
    expect(service.isLoggedIn()).toBeFalse();
  });

  it('should clear localStorage on logout', () => {
    localStorage.setItem('token', 'mytoken');
    localStorage.setItem('email', 'test@test.com');
    service.logout();

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('email')).toBeNull();
  });

  it('should return correct role', () => {
    localStorage.setItem('role', 'ROLE_ADMIN');
    expect(service.getRole()).toBe('ROLE_ADMIN');
  });

  it('should check role correctly', () => {
    localStorage.setItem('role', 'ROLE_ADMIN');
    expect(service.hasRole('ROLE_ADMIN')).toBeTrue();
    expect(service.hasRole('ROLE_CAMPER')).toBeFalse();
  });

  it('should return idUser as number', () => {
    localStorage.setItem('idUser', '5');
    expect(service.getIdUser()).toBe(5);
  });
>>>>>>> origin/Marketplace-and-delivery
});