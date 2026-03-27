export const CFG = {
  repoOwner: 'pandotic',
  repoName: 'pando-skillo',
  branch: 'main',
};

export const RAW = (path) =>
  `https://raw.githubusercontent.com/${CFG.repoOwner}/${CFG.repoName}/${CFG.branch}/${path}`;

export const MANIFEST_URL = RAW('skills-manifest.json');
