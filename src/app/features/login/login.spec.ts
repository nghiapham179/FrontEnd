import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let router: Router;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have initial model values empty', () => {
    expect(component.model.username).toBe('');
    expect(component.model.password).toBe('');
    expect(component.model.remember).toBeFalse();
    expect(component.isSubmitting).toBeFalse();
  });

  it('should show alert when username or password is empty', () => {
    spyOn(window, 'alert');

    // Test empty username
    component.model.username = '';
    component.model.password = 'password123';
    component.onSubmit();

    expect(window.alert).toHaveBeenCalledWith('Vui lòng nhập đủ Username và Password');

    // Test empty password
    component.model.username = 'testuser';
    component.model.password = '';
    component.onSubmit();

    expect(window.alert).toHaveBeenCalledWith('Vui lòng nhập đủ Username và Password');
  });

  it('should set isSubmitting to true when form is valid', () => {
    component.model.username = 'testuser';
    component.model.password = 'password123';

    component.onSubmit();

    expect(component.isSubmitting).toBeTrue();
  });

  it('should save to localStorage when remember is true', (done) => {
    spyOn(localStorage, 'setItem');
    component.model.username = 'testuser';
    component.model.password = 'password123';
    component.model.remember = true;

    component.onSubmit();

    setTimeout(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('rememberUser', 'testuser');
      done();
    }, 600);
  });

  it('should remove from localStorage when remember is false', (done) => {
    spyOn(localStorage, 'removeItem');
    component.model.username = 'testuser';
    component.model.password = 'password123';
    component.model.remember = false;

    component.onSubmit();

    setTimeout(() => {
      expect(localStorage.removeItem).toHaveBeenCalledWith('rememberUser');
      done();
    }, 600);
  });

  it('should navigate to home after successful login', (done) => {
    component.model.username = 'testuser';
    component.model.password = 'password123';

    component.onSubmit();

    setTimeout(() => {
      expect(router.navigate).toHaveBeenCalledWith(['/']);
      done();
    }, 600);
  });

  it('should reset isSubmitting after timeout', (done) => {
    component.model.username = 'testuser';
    component.model.password = 'password123';

    component.onSubmit();
    expect(component.isSubmitting).toBeTrue();

    setTimeout(() => {
      expect(component.isSubmitting).toBeFalse();
      done();
    }, 600);
  });
});
