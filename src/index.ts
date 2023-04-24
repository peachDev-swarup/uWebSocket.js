export function ExpFromRoute(path: string): RegExp {
     return new RegExp(path.replace(/:[^\s/]+/g, '([\\w-]+)'));
};