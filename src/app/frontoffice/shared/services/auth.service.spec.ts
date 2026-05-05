
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

// src/app/frontoffice/shared/services/auth.service.spec.ts


import { RegisterRequest, LoginRequest, AuthResponse } from '../models/auth.model';


describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;


  beforeEach(() => {
    TestBed.configureTestingModule({

      imports: [HttpClientTestingModule]
    });


      ,
      providers: [AuthService]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });


  afterEach(() => {
    httpMock.verify();
    localStorage.clear();

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();

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

  const dummyRegisterRequest: RegisterRequest = {
    firstName: 'Mohamed',
    lastName: 'Oueslati',
    email: 'mohamed@example.com',
    password: '123456',
    phone: '12345678',
    role: 'USER'
  };

  const dummyLoginRequest: LoginRequest = {
    email: 'mohamed@example.com',
    password: '123456'
  };

  const dummyAuthResponse: AuthResponse = {
    token: 'fake-jwt-token',
    email: 'mohamed@example.com',
    role: 'USER'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should register a user', () => {
    service.register(dummyRegisterRequest).subscribe(res => {
      expect(res).toBe('User registered successfully');
    });

    const req = httpMock.expectOne('http://localhost:8088/campConnect/auth/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dummyRegisterRequest);
    req.flush('User registered successfully');
  });

  it('should login and store token, email, role in localStorage', () => {
    service.login(dummyLoginRequest).subscribe(res => {
      expect(res).toEqual(dummyAuthResponse);
      expect(localStorage.getItem('token')).toBe(dummyAuthResponse.token);
      expect(localStorage.getItem('email')).toBe(dummyAuthResponse.email);
      expect(localStorage.getItem('role')).toBe(dummyAuthResponse.role);

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

    expect(req.request.body).toEqual(dummyLoginRequest);
    req.flush(dummyAuthResponse);
  });

  it('should logout and remove token, email, role from localStorage', () => {
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('email', 'test@example.com');
    localStorage.setItem('role', 'USER');


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

    expect(localStorage.getItem('role')).toBeNull();
  });

  it('should get token, email, role from localStorage', () => {
    localStorage.setItem('token', 'abc');
    localStorage.setItem('email', 'user@test.com');
    localStorage.setItem('role', 'ADMIN');

    expect(service.getToken()).toBe('abc');
    expect(service.getEmail()).toBe('user@test.com');
    expect(service.getRole()).toBe('ADMIN');
  });

  it('should return isLoggedIn true when token exists', () => {
    localStorage.setItem('token', 'token123');
    expect(service.isLoggedIn()).toBeTrue();
  });

  it('should return isLoggedIn false when no token', () => {
    expect(service.isLoggedIn()).toBeFalse();
  });

  it('should check hasRole correctly', () => {
    localStorage.setItem('role', 'ADMIN');
    expect(service.hasRole('ADMIN')).toBeTrue();
    expect(service.hasRole('USER')).toBeFalse();
  });

});