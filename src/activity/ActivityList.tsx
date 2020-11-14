import {
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader, IonIcon, IonItem, IonLabel,
    IonList,
    IonLoading,
    IonPage,
    IonTitle,
    IonToolbar
} from "@ionic/react";
import React from "react";
import {useActivity} from "./UseActivity";
import {ActivityInterface} from "./ActivityInterface";
import Activity from "./Activity";
import {add} from "ionicons/icons";

const ActivityList: React.FC = () => {
    const { activities, fetching, fetchingError, addActivity } = useActivity();
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>My Activities</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonLoading isOpen={fetching} message="Fetching items" />
                <IonItem>
                    <IonLabel>ID</IonLabel>
                    <IonLabel>ACTIVITY NAME</IonLabel>
                    <IonLabel>CREATED DATE</IonLabel>
                    <IonLabel>UPDATED DATE</IonLabel>
                </IonItem>
                {activities && (
                    <IonList>
                        {
                            activities.map((activity: ActivityInterface) => <Activity key={activity.id} {...activity} />)
                        }
                    </IonList>
                )}
                {fetchingError && (
                    <div>{fetchingError.message || 'Failed to fetch items'}</div>
                )}
                <IonFab vertical="bottom" horizontal="center" slot="fixed">
                    <IonFabButton onClick={addActivity}>
                        <IonIcon icon={add} />
                    </IonFabButton>
                </IonFab>
            </IonContent>
        </IonPage>
    );
};

export default ActivityList;
