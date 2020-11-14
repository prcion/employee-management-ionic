import React from "react";
import {ActivityInterface} from "./ActivityInterface";
import {IonItem, IonLabel} from "@ionic/react";

const Activity: React.FC<ActivityInterface> = (activityInterface: ActivityInterface) => {
    return (
        <IonItem>
            <IonLabel>
                {activityInterface.id}
            </IonLabel>
            <IonLabel>
                {activityInterface.name}
            </IonLabel>
            <IonLabel>
                {new Date(activityInterface.createdDate).toDateString()}
            </IonLabel>
            <IonLabel>
                {new Date(activityInterface.updatedDate).toDateString()}
            </IonLabel>
        </IonItem>
    )
}

export default Activity;
