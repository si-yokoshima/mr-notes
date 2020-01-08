export type Project = {
  id: number,
  name: string,
  path_with_namespace: string
}
export type MR = {
  id: number,
  iid: number,
  title: string,
  project: Project
}
export type Note = {
  id: number,
  type: string,
  body: string,
  author: Author,
  noteable_iid: number,
  mr: MR
}
export type Author = {
  id: number,
  name: string,
  username: string
}
export type Comment = {
  projectName: string,
  MRTitle: string,
}