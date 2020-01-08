import React, { useState } from 'react';
import axios, { AxiosResponse } from 'axios'
import Table from './Table'
import { Grid, Fab, Container, makeStyles, Theme, createStyles } from '@material-ui/core';
import { Add } from '@material-ui/icons'
import { Project, MR, Note } from './Types';
import { Line } from 'rc-progress'


function App() {
  const [notes, setNotes] = useState<Note[]>([])
  const [progress, setProgress] = useState<number>(0)
  const endpoint = 'https://gitlab.com/api/v4'
  const groupName = 'gamespf/service/store/store_vn'
  const ax = axios.create({
    baseURL: endpoint,
    headers: { 'PRIVATE-TOKEN': process.env.REACT_APP_PRIVATE_KEY }
  })
  const getMR = async () => {
    setProgress(0)
    console.time('MR')
    let pMRs: Promise<void | AxiosResponse>[] = []
    let MRs: MR[] = [];
    await getGroup().then(async (res) => {
      console.log(res)
      const projects: any[] = res.data.projects
      const numberOfProjects = projects.length
      await projects.forEach((project: Project, index: number) => {
        pMRs.push(getMergeRequest(project)
          .then((res) => {
            const projectMRs = res.data.map((mr: MR) => {
              mr.project = project
              return mr
            })
            return projectMRs
          }))
        setProgress((index + 1) / numberOfProjects)
      })

      await Promise.all(pMRs).then((res) => {
        MRs = MRs.concat(res.flat())
      })
    })

    let pNotes: Promise<void | AxiosResponse>[] = []
    MRs.forEach((mr: MR) => {
      pNotes.push(
        getNotes(mr).then((res) => {
          const MRNotes = res.data.map((note: Note) => {
            note.mr = mr
            return note
          })
          return MRNotes
        })
      )
    })
    let notes: Note[] = []
    Promise.all(pNotes).then((res) => {
      notes = notes.concat(res.flat())
      setNotes(notes)
    })


  }

  const getGroup = () => ax.get(`/groups/${encodeURIComponent(groupName)}`)
  const getMergeRequest = (project: Project) =>
    ax.get(`/projects/${encodeURIComponent(project.path_with_namespace)}/merge_requests`)


  const getNotes = (mr: MR) =>
    ax.get(`/projects/${mr.project.id}/merge_requests/${mr.iid}/notes`)

  const useStyles = makeStyles((theme: Theme) =>
    createStyles({
      root: {
        '& > *': {
          margin: theme.spacing(1),
        },
      },
      extendedIcon: {
        marginRight: theme.spacing(1),
      },
    }),
  );
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Container>
        <Line percent={progress}></Line>
        <Table notes={notes} />
        <Fab color="primary" aria-label="add" onClick={() => getMR()}>
          <Add />
        </Fab>
      </Container>

    </div>
  );
}

export default App;
