import slugifyPackage from 'slugify';

export function slugify(text: string): string {
  return slugifyPackage(text, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
  });
}

export function generateUniqueSlug(baseSlug: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 7);
  return `${baseSlug}-${timestamp}-${random}`;
}
