import {
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonLoading,
    IonPage,
    IonTitle,
    IonToolbar
} from "@ionic/react";
import React, {useContext} from "react";
import {ActivityInterface} from "./ActivityInterface";
import Activity from "./Activity";
import {add} from "ionicons/icons";
import {ActivityContext} from "./ActivityProvider";
import {RouteComponentProps} from "react-router";

const ActivityList: React.FC<RouteComponentProps> = ({ history }) => {
    const { activities, fetching, fetchingError } = useContext(ActivityContext);
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
                            activities.map((activity: ActivityInterface) =>
                                <Activity key={activity.id} id={activity.id} name={activity.name} onEdit={id => history.push(`/activity/${id}`)} />)
                        }
                    </IonList>
                )}
                {fetchingError && (
                    <div>{fetchingError.message || 'Failed to fetch items'}</div>
                )}
                <IonFab vertical="bottom" horizontal="center" slot="fixed">
                    <IonFabButton onClick={() => history.push('/activity')}>
                        <IonIcon icon={add} />
                    </IonFabButton>
                </IonFab>
            </IonContent>
        </IonPage>
    );
};

export default ActivityList;
