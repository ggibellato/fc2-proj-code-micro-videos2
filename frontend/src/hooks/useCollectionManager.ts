import { useSnackbar } from "notistack";

const useCollectionManager = (collection: any[], setCollection: (item: any) => void) => {
    const snackbar = useSnackbar();
    return {
        addItem(item: any) {
            if(!item || item === "") {
                return;
            }
            const exists = collection.find(i => i.id === item.id);
            if(exists) {
                snackbar.enqueueSnackbar(
                    'Item ja adicionado', {variant: 'info'}
                )
            }
            else {
                collection.unshift(item);
                setCollection(collection);
                //setValue([...collection, item]);
            }
        },
        removeItem(item: any) {
            const index = collection.findIndex(i => i.id === item.id);
            if(index === -1){
                return;
            }
            collection.splice(index, 1);
            setCollection(collection);
        }
    }
};

export default useCollectionManager