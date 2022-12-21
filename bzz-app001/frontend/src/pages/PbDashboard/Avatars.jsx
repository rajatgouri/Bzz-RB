import React, { useEffect, useRef, useState } from "react";
import { Row, Col, Button, notification , Radio, Divider} from "antd";
import { DashboardLayout } from "@/layout";
import { request } from "@/request";
import { selectAuth } from "@/redux/auth/selectors";
import { useSelector } from "react-redux";
import PageLoader from "@/components/PageLoader";


const dashboardStyles = {
  content: {
    "boxShadow": "none",
    "padding": "35px",
    "width": "100%",
    "overflow": "auto",
    "background": "#eff1f4",
    "margin": "auto",
    "maxWidth": "1330px",
    "height" : "0px"
  },
  section : {
    minHeight: "100vh", 
    maxHeight: "100vh",
    minWidth: "1300px"
  }
}


export default function Avatars() {
  
  const [selectedImage, setSelectedImage] = useState("");
  const [images, setImages ] = useState([])
  const { current } = useSelector(selectAuth);
  const [category, setCategory] = useState(localStorage.getItem('category')? localStorage.getItem('category') :  'Spring')
  const [tabs, setTabs] = useState([])

  const onImageClick = ({index}) => {
    setSelectedImage(index);

    let imagesList = images

    for(let i=0 ; i<images.length ;i++) {

      if(images[i].index  != index) {
        imagesList[i].active = false
      }
    }

    imagesList[imagesList.findIndex(image => image.index == index)].active = !imagesList[imagesList.findIndex(image => image.index == index)].active
    // imagesList[index].gray = !imagesList[index].gray

    // setImages([])
    setTimeout(() => setImages([...imagesList]), 0)
    
  }

  const onSaveAvatar = async () => {

    localStorage.setItem('category', category)

    if(images[images.findIndex((image) => image.index ==selectedImage)]) {


      if(images[images.findIndex((image) => image.index ==selectedImage)].gray && ! images[images.findIndex((image) => image.index ==selectedImage)].active) {
        await request.update("admin-avatar", current.EMPID, {AvatarIndex:  100000000 , Avatar: null  });
        notification.success({message: "Avatar Removed successfully!"})

        load(category)
        return 
      }

      if(images[images.findIndex((image) => image.index ==selectedImage)].gray ) {
        return 
      }

      await request.update("admin-avatar",  current.EMPID, {AvatarIndex: images[images.findIndex((image) => image.index ==selectedImage)].index  , Avatar: images[images.findIndex((image) => image.index ==selectedImage)].data,  AvatarCategory: category});
      notification.success({message: "Avatar Added successfully!"})
      load(category)
    }
    
  }

  const getTabs =async () => {
    let {result} = await request.list('avatar-tabs')
    setTabs(result)
    load(category)
  }

  useEffect(() => {
    getTabs()
  }, [])


  
  const load  = (tab) => {
    (async () => {
      let [{result: users}, {result: images}] = await Promise.all([
        await request.list('getuserbysection'),
        await request.list('avatar-images', {
           folder: "Avatars/" + tab + "/"
        })
      ]);
      setImages([])

      const user = users.filter((list) => list.EMPID == current.EMPID)[0]

    
      images = images.map((image) => {
        image.category = image['category'].split('/')[1]
        return image
      })

        users.map((result) => {
          images.map((image, i) =>  {
            
            if(image.index == result.AvatarIndex && image.category == result.AvatarCategory ) {
              image.gray = true
            }


            if (image.index  == user.AvatarIndex &&  image.category == result.AvatarCategory) {
              image.active = true
            }

          })
       })

       setImages([...images])

      
    })()
  } 

  

  const onchangeTab =(tab) => {

    setCategory(tab)
    load(tab)
  }

  return (
    <DashboardLayout style={dashboardStyles}>
      
      <Row gutter={[24, 24]} style={{height: "100%"}}>
     
      <Col className="gutter-row" style={{width: "100%", height: "100%"}}>
          <div className="whiteBox shadow" style={{ height: "100%", overflow: "auto" }}>
            <div
              className="pad20"
              style={{height: "100%"}}
            >
              <h3 className="calendar-header" style={{fontSize: '14px !important'}}>Avatars</h3>
              
              <Col span={24}>
      <Row gutter={[24, 24]}>
                <Col style={{width: "90%", paddingLeft: "5px"}} >
                        <Radio.Group value={category} onChange={(e) => onchangeTab(e.target.value)}>
                           {
                             tabs && tabs.map(t => {
                              return <Radio.Button value={t.value} className="mr-6 mb-6 box-shadow">{t.name}</Radio.Button>

                             })
                           }
                           
                          </Radio.Group>
                 </Col>
                <Col style={{width: "10%", paddingRight: "7px"}} className="text-right">
                    <Button type="primary" onClick={onSaveAvatar}>Save</Button>
                 </Col>

              </Row>
        </Col>
               <div className="images-container">

                 {

                   images.map((image , index) => {
                     
                    return <div key={index} className={image.active ? "image-active" : "image-deactive"}  style={{width: "10%", height: "120px", display: "inline-block", padding: "5px" ,borderRadius: "10px", border: image.active ? "1px solid " : "none"}}  onClick={() => onImageClick(image)}>
                      <img src={image.data} width="100%" height="100%" style={{objectFit: "cover", filter: image.gray ? "grayscale(100%)" : "none"}}/>
                    </div>
                   })
                   
                 }
              </div>
              
            </div>
          </div>
        </Col>
      </Row>
      <div className="space30"></div>
      {/* <Row gutter={[24, 24]}>
        <Col className="gutter-row" span={24}>
          <div className="whiteBox shadow">
            <div >
              
            </div>
            <CalendarBoard editable={false}/>
          </div>
        </Col>

      </Row> */}
    </DashboardLayout>
  );
}
