import React, { useState, createRef, useReducer, useRef } from 'react';
import axios, { AxiosResponse } from 'axios'
import Table from './Table'

import { Grid, Fab, Container, makeStyles, Theme, createStyles } from '@material-ui/core';
import { Add } from '@material-ui/icons'
import { Project, MR, Note } from './Types';
import { Line } from 'rc-progress'
import Table2 from './Table2';
import { createReadStream } from 'fs';


function App() {
  const [notes, setNotes] = useState<Note[]>([])
  const [progress, setProgress] = useState<number>(0)
  const endpoint = 'https://gitlab.com/api/v4'
  const groupName = 'gamespf/service/store/store_vn'
  const ref = useRef(createRef())
  
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
        setProgress(((index + 1) / numberOfProjects) * 100)
      })

      await Promise.all(pMRs).then((res) => {
        MRs = MRs.concat(res.flat())
      })
    })

    let pNotes: Promise<void | AxiosResponse>[] = []
    const numberOfMRs = MRs.length
    let pNotesCount = 1
    setProgress(0)
    MRs.forEach((mr: MR, index: number) => {
      pNotes.push(
        getNotes(mr).then((res) => {
          const MRNotes = res.data.map((note: Note) => {
            note.mr = mr
            return note
          })
          return MRNotes
          setProgress((pNotesCount++ / numberOfNotes) * 100)
        })
      )
      setProgress(((index + 1) / numberOfMRs) * 100)

    })
    let notes: Note[] = []
    const numberOfNotes = pNotes.length
    setProgress(0)
  
    Promise.all(pNotes).then((res) => {
      notes = notes.concat(res.flat())
      console.log(notes)
      setNotes(notes)
    })


  }

  const getGroup = () => ax.get(`/groups/${encodeURIComponent(groupName)}`)
  const getMergeRequest = (project: Project) =>
    ax.get(`/projects/${encodeURIComponent(project.path_with_namespace)}/merge_requests`)


  const getNotes = (mr: MR) =>
    ax.get(`/projects/${mr.project.id}/merge_requests/${mr.iid}/notes`)

  return (
    <div>
      
      <Container>
      <Table2 notes={notes}/>
        <Line percent={progress}></Line>
        {/* <Table notes={notes} /> */}
        
        <Fab color="primary" aria-label="add" onClick={() => getMR()}>
          <Add />
        </Fab>
      </Container>

    </div>
  );
}

export default App;
