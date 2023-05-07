import {Props} from 'framework7/types/modules/component/snabbdom/modules/props';
import {ComponentContext} from 'framework7/modules/component/component';
import {RollPage} from '../pages/page_roll';
import {SamplePage} from '../pages/page_sample_editor';

const pages = {
    page_roll: RollPage,
    page_sample_editor: SamplePage,
};

// https://framework7.io/docs/init-app.html
// https://framework7.io/docs/kitchen-sink.html
// https://framework7.io/docs/router-component
export const pageRc = (props: Props, context: ComponentContext) => {

    if (!pages[props.id]) {
        return () => context.$h`<div class="page">COMPONENT NOT FOUND</div>`;
    }

    let vc = new pages[props.id](props, context);

    // Called right before component will be added to DOM
    context['$onBeforeMount'](() => vc.onBeforeMount && vc.onBeforeMount());
    // Called right after component was be added to DOM
    context['$onMounted'](() => vc.onMounted && vc.onMounted());

    // Called right after component before VDOM will be patched/updated
    context['$onBeforeUpdate'](() => vc.onBeforeUpdate && vc.onBeforeUpdate());
    // Called right after component VDOM has been patched/updated
    context['$onUpdated'](() => vc.onUpdated && vc.onUpdated());

    // Called right before component will be unmounted (detached from the DOM)
    context['$onBeforeUnmount'](() => vc.onBeforeUnmount && vc.onBeforeUnmount());
    // Called when component unmounted and destroyed
    context['$onUnmounted'](() => vc.onUnmounted && vc.onUnmounted());

    // https://framework7.io/docs/router-component
    // (context as any).$on('pageInit', (e: any, page: Router.Page) => {
    //  console.log('pageInit');
    //   //console.log('# E', e);
    //   //console.log('# PROPS', props);
    //   //console.log('# PAGE', page);
    //   //console.log('# CONTEXT', context);
    //   vc = new pages[props.id](props, context);
    // });

    return () => context.$h`<div class="page"></div>`;
};