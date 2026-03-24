import { signInSchema, signUpSchema } from '../schemas/auth.schema';

// ── signInSchema ─────────────────────────────────────────────────────────────

describe('signInSchema', () => {
  const valid = { email: 'user@example.com', password: 'Password1' };

  it('accepts valid credentials', () => {
    expect(signInSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects an invalid email', () => {
    const result = signInSchema.safeParse({ ...valid, email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('rejects a password shorter than 8 characters', () => {
    const result = signInSchema.safeParse({ ...valid, password: 'Ab1' });
    expect(result.success).toBe(false);
  });

  it('rejects empty email', () => {
    const result = signInSchema.safeParse({ ...valid, email: '' });
    expect(result.success).toBe(false);
  });
});

// ── signUpSchema ─────────────────────────────────────────────────────────────

describe('signUpSchema', () => {
  const valid = {
    displayName: 'Wissem',
    email: 'wissem@example.com',
    role: 'user' as const,
    password: 'Password1',
    confirmPassword: 'Password1',
  };

  it('accepts a valid member sign-up', () => {
    expect(signUpSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts a professional role', () => {
    const result = signUpSchema.safeParse({ ...valid, role: 'professional' });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid role', () => {
    const result = signUpSchema.safeParse({ ...valid, role: 'admin' });
    expect(result.success).toBe(false);
  });

  it('rejects a display name shorter than 2 characters', () => {
    const result = signUpSchema.safeParse({ ...valid, displayName: 'A' });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid email', () => {
    const result = signUpSchema.safeParse({ ...valid, email: 'bad-email' });
    expect(result.success).toBe(false);
  });

  it('rejects a password without an uppercase letter', () => {
    const result = signUpSchema.safeParse({
      ...valid,
      password: 'password1',
      confirmPassword: 'password1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a password without a number', () => {
    const result = signUpSchema.safeParse({
      ...valid,
      password: 'PasswordOnly',
      confirmPassword: 'PasswordOnly',
    });
    expect(result.success).toBe(false);
  });

  it('rejects mismatched passwords', () => {
    const result = signUpSchema.safeParse({
      ...valid,
      confirmPassword: 'Different1',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'));
      expect(paths).toContain('confirmPassword');
    }
  });

  it('rejects a password shorter than 8 characters', () => {
    const result = signUpSchema.safeParse({
      ...valid,
      password: 'Ab1',
      confirmPassword: 'Ab1',
    });
    expect(result.success).toBe(false);
  });
});
