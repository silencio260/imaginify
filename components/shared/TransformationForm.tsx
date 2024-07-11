"use client"
 
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
 
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { aspectRatioOptions, defaultValues } from "@/constants"
import { CustomField } from './CustomField';
import { transformationTypes } from '../../constants/index';
import { useState, useTransition } from "react"
import { AspectRatioKey, debounce, deepMergeObjects } from "@/lib/utils"

  
 
export const formSchema = z.object({
  title: z.string(),
  aspectRatio: z.string().optional(),
  color: z.string().optional(),
  prompt: z.string().optional(),
  publicId: z.string(),

})

const TransformationForm = ({action, data = null, userId, type, creditBalance, config=null}: TransformationFormProps) => {

    const transformationType = transformationTypes[type]
    const [image, setImage] = useState(data)
    const [newTranformation, setNewTranformation] = useState<Transformations | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isTransforming, setIsTransforming] = useState(false)
    const [transformationConfig, setTransformationConfig] = useState(config)
    const [isPending, startTransition] = useTransition()


    const initialValues =  data && action === 'Update' ? 
    {
        title: data?.title,
        aspectRatio: data?.aspectRatio,
        color:  data?.color,
        prompt:  data?.prompt,
        publicId:  data?.publicId,
    } : defaultValues
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialValues,
    })

    function onSubmit(values: z.infer<typeof formSchema>) {

        console.log(values)
    }
    
    const onSelectFieldHandler = (value: string, onChangeField:(value: string) => void) => {

        const imageSize = aspectRatioOptions[value as AspectRatioKey]

        setImage((prevState: any) => ({
            ...prevState,
            aspectRatioOptions: imageSize.aspectRatio,
            width: imageSize.width,
            height: imageSize.height
        }))

        setNewTranformation(transformationType.config)

        return onChangeField(value)
    }

    const onInputChangeHandle = (fieldName: string, value: string,
        type: string, onChangeField: (value: string) => void) => {

        debounce(() => {
            setNewTranformation((prevState: any) => ({
                ...prevState,
                [type]: {
                    ...prevState?.[type],
                    [fieldName === 'prompt' ? 'prompt' : 'to'] : value
                }
            }))

            return onChangeField(value)
        }, 1000)

    }

    //TODO: implement transformation credits
    const onTransformHandler = async () => {
        setIsTransforming(true)

        setTransformationConfig(
            deepMergeObjects(newTranformation, transformationConfig)
        )

        setNewTranformation(null)

        startTransition(async () => {
            //await transformation credit
        })

    }




  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
       <CustomField
            control={form.control}
            name="title"
            formLabel="Image Title"
            className="w-full"
            render={({ field }) => <Input
                {...field} className="input-field"
            />}   
       />

        {type === 'fill' && (
            
            <CustomField 
                control={form.control}
                name="aspectRatio"
                formLabel="Aspect Ratio"
                className="w-full"
                render={({ field }) => (
                    <Select
                        onValueChange={(value: any) => onSelectFieldHandler(value, field.onChange)}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Theme" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.keys(aspectRatioOptions).map((key) => (

                               <SelectItem
                                    key={key}
                                    value={key}
                                    className='select-item'
                                >
                                    {aspectRatioOptions[key as AspectRatioKey].label}
                               </SelectItem>

                            ))}
                        </SelectContent>
                    </Select>
                )}
            />
        )}

        {((type === 'remove') || (type === 'recolor')) && (
            <div className="prompt-field">
                <CustomField 
                    control={form.control}
                    name="prompt"
                    formLabel={
                        type === 'remove' ? 'Object to remove' : 'Object to recolor'
                    }
                    className="w-full"
                    render={ (({field}) => (
                        <Input 
                            value={field.value}
                            className="input-field"
                            onChange={(e) => onInputChangeHandle(
                                'prompt',
                                e.target.value,
                                type,
                                field.onChange
                            )}
                        />
                    ))
                    }
                />

                {type === 'recolor' && (
                    <CustomField 
                        control={form.control}
                        name="color"
                        formLabel="Replacement Color"
                        className="w-full"
                        render={({field}) => (
                            <Input 
                                value={field.value}
                                className="input-field"
                                onChange={(e) => onInputChangeHandle(
                                    'color',
                                    e.target.value,
                                    'recolor',
                                    field.onChange
                                )}
                            />
                        )}
                    />
                )}
            </div>
        )}

        <div className="flex flex-col gap-4">
            <Button 
                type="button"
                className="submit-button capitalize"
                disabled={isTransforming || newTranformation === null}
                onClick={onTransformHandler}
            >
                {isTransforming ? 'Transfroming...' : 'Apply transfromation'}
            </Button>
            <Button 
                type="submit"
                className="submit-button capitalize"
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Submitting...' : 'Save Image'}
            </Button>
        </div>




                                

      </form>
    </Form>
  )
}

export default TransformationForm