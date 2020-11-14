import {RouteComponentProps} from "react-router";
import React, {useContext, useEffect, useState} from "react";
import {ActivityContext} from "./ActivityProvider";
import {ActivityInterface} from "./ActivityInterface";
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonInput,
    IonLoading,
    IonPage,
    IonTitle,
    IonToolbar
} from '@ionic/react';

interface ActivityEditProps extends RouteComponentProps<{
    id?: string;
}> {}

const ActivityEdit: React.FC<ActivityEditProps> = ({ history, match }) => {
    const { activities, saving, savingError, saveActivity } = useContext(ActivityContext);
    const [name, setName] = useState('');
    const [activity, setItem] = useState<ActivityInterface>();
    useEffect(() => {
        const routeId = match.params.id || '';
        console.log(routeId);
        const activity = activities?.find(it => it.id?.toString() === routeId);
        console.log(activity?.name);
        setItem(activity);
        if (activity) {
            setName(activity.name);
        }
    }, [match.params.id, activities]);
    const handleSave = () => {
        const editedActivity = activity ? { ...activity, name } : { name };
        saveActivity && saveActivity(editedActivity).then(() => history.goBack());
    };
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Edit</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={handleSave}>
                            Save
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonInput value={name} onIonChange={e => setName(e.detail.value || '')} />
                <IonLoading isOpen={saving} />
                {savingError && (<div>{savingError.message || 'Failed to save item'}</div>)}
            </IonContent>
        </IonPage>
    );
};

export default ActivityEdit;
