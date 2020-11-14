import React from "react";
import {ActivityInterface} from "./ActivityInterface";
import {IonItem, IonLabel} from "@ionic/react";

interface ActivityPropsExt extends ActivityInterface {
    onEdit: (id?: string) => void;
}

const Activity: React.FC<ActivityPropsExt> = ({id, name, createdDate, updatedDate, onEdit}) => {
    return (
        <IonItem onClick={() => onEdit(id?.toString())}>
            <IonLabel>{id}</IonLabel>
            <IonLabel>{name}</IonLabel>
            <IonLabel>{new Date(createdDate || 0).toDateString()}</IonLabel>
            <IonLabel>{new Date(updatedDate || 0).toDateString()}</IonLabel>
        </IonItem>
    )
}

export default Activity;
