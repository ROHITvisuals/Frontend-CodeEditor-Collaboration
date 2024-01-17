import React, { useEffect, useRef } from 'react'
import Codemirror, { changeEnd } from 'codemirror';
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/dracula.css'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/addon/edit/closetag'
import 'codemirror/addon/edit/closebrackets'

const Editor = ({ socketRef, roomId , onCodeChange }) => {
  const editorRef = useRef(null)
  useEffect(() => {
    const init = async () => {
      editorRef.current = Codemirror.fromTextArea(document.getElementById('realTimeEditor'), {
        mode: { name: 'javascript', json: true },
        theme: 'dracula',
        autoCloseTags: true,
        autoCloseBrackets: true,
        LineNumbers: true
      })

      // editorRef.current.on("change", (instance, changes) => {   // pre-defined "change" event of codeMirror // editor.on('change' , ()=>{})
      //   console.log("changes", changes);
      //   console.log("instance", instance.getValue());
      //   const {origin} = changes ;
      // })

      editorRef.current.on('change', (instance, changes) => {
        console.log("changes", changes);
        console.log("instance", instance.getValue());
        const { origin } = changes;
        const code = instance.getValue();
        onCodeChange(code);
        if (origin !== 'setValue') {
          socketRef.current.emit("code-change", {
            roomId,
            code,
          });
        }
      });

      // console.log("socketRef.current" , socketRef.current);
      // console.log("socketRef" , socketRef);
      if (socketRef.current) {
        socketRef.current.on("code-change", ({ code }) => {
          if (code !== null) {  // this check is because if the code  is null , then all the code will disappear
            editorRef.current.setValue(code);
          }
        });
      }
      // editorRef.current.setValue(`console.log("hello)`)
    }
    init()
  }, [])


  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on( "code-change" , ({ code }) => {
        if (code !== null) {
          editorRef.current.setValue(code);
        }
      });
    }

    return () => {
        socketRef.current.off("code-change");
    };
  }, [socketRef.current]);

  return (
    <textarea id='realTimeEditor'>

    </textarea>
  )
}

export default Editor
