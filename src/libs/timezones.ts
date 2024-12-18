export const toUrlSafe = (timezones: string[]) => {
  return timezones.map((tz) => tz.replace('/', '-')).join('__')
}

export const fromUrlSafe = (pathname: string) => {
  return pathname
    .replace(/^\//, '')
    .split('__')
    .filter((e) => e !== '')
    .map((tz) => tz.replace('-', '/'))
}
